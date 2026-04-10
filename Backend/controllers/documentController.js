import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import axios from "axios";
import documentModel from "../models/documentModel.js";
import redis from "../config/redis.js";

const DAILY_UPLOAD_LIMIT = 2;

const EXTENSION_SIZE_LIMITS = {
  pdf: 15 * 1024 * 1024,
  docx: 5 * 1024 * 1024,
  txt: 2 * 1024 * 1024,
  image: 5 * 1024 * 1024,
};

const MIMETYPE_TO_FILETYPE = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
};

// Redis key for daily upload count — auto expires in 24 hours
const getDailyUploadKey = (userId) => {
  const today = new Date().toISOString().split("T")[0];
  return `doc_upload:${userId}:${today}`;
};

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const fileType = MIMETYPE_TO_FILETYPE[req.file.mimetype];
    if (!fileType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported file type" });
    }

    // Extension wise size check
    const sizeLimit = EXTENSION_SIZE_LIMITS[fileType];
    if (req.file.size > sizeLimit) {
      const limitMB = sizeLimit / (1024 * 1024);
      return res.status(400).json({
        success: false,
        message: `${fileType.toUpperCase()} files must be under ${limitMB}MB`,
      });
    }

    // Daily limit check via Redis
    const redisKey = getDailyUploadKey(userId);
    const uploadCountToday = parseInt((await redis.get(redisKey)) || "0");

    if (uploadCountToday >= DAILY_UPLOAD_LIMIT) {
      return res.status(429).json({
        success: false,
        message: `Daily upload limit reached (${DAILY_UPLOAD_LIMIT} uploads/day). Try again tomorrow.`,
      });
    }

    // Upload to Cloudinary
    const today = new Date().toISOString().split("T")[0];

    // PDF aur DOCX ke liye raw, images ke liye auto
    const resourceType = ["pdf", "docx", "txt"].includes(fileType)
      ? "raw"
      : "auto";

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `lawbridge/user-documents/${userId}`,
          public_id: `${Date.now()}-${req.file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    // Call Python chatbot API
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("user_id", userId);
    formData.append("cloudinary_url", cloudinaryResult.secure_url);

    let pythonResult;
    try {
      const pythonResponse = await axios.post(
        `${process.env.RAG_CHATBOT_API_URL}/upload-document`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            secure_key: process.env.RAG_SECRET_KEY,
          },
        },
      );
      pythonResult = pythonResponse.data;
    } catch (axiosError) {
      // Cloudinary pe upload ho gaya tha, clean up karo
      await cloudinary.uploader.destroy(cloudinaryResult.public_id, {
        resource_type: resourceType,
      });
      const message =
        axiosError.response?.data?.detail || "Document processing failed";
      return res.status(500).json({ success: false, message });
    }

    // Save to MongoDB
    const document = await documentModel.create({
      userId,
      filename: req.file.originalname,
      fileType,
      cloudinaryUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      chunksStored: pythonResult.chunks_stored,
      pineconeNamespace: pythonResult.namespace,
      uploadDate: today,
    });

    // Redis counter increment karo — TTL 24 hours
    await redis.incr(redisKey);
    await redis.expire(redisKey, 86400);

    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully",
      document: {
        _id: document._id,
        filename: document.filename,
        fileType: document.fileType,
        cloudinaryUrl: document.cloudinaryUrl,
        chunksStored: document.chunksStored,
        createdAt: document.createdAt,
      },
      uploadsRemaining: DAILY_UPLOAD_LIMIT - (uploadCountToday + 1),
    });
  } catch (error) {
    console.error("uploadDocument error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// User ki saari uploaded files list karo
// Frontend pe documents list dikhane ke liye
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    const documents = await documentModel
      .find({ userId })
      .select("filename fileType cloudinaryUrl chunksStored createdAt")
      .sort({ createdAt: -1 });

    // Daily uploads remaining from Redis
    const redisKey = getDailyUploadKey(userId);
    const uploadCountToday = parseInt((await redis.get(redisKey)) || "0");

    return res.status(200).json({
      success: true,
      documents,
      uploadsToday: uploadCountToday,
      uploadsRemaining: Math.max(0, DAILY_UPLOAD_LIMIT - uploadCountToday),
    });
  } catch (error) {
    console.error("getUserDocuments error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
