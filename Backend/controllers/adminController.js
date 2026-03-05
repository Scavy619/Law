import UserModel from "../models/userModel.js";
import lawyerModel from "../models/lawyerModel.js";
import dotenv from "dotenv/config";
import appointmentModel from "../models/appointmentModel.js";
import { verifyPassword, hashPasswordWithSalt } from "../utils/hash.js";
import { v2 as cloudinary } from "cloudinary";
import {
  addLawyerByAdminSchema,
  loginPostRequestBodySchema,
} from "../validations/reqValidation.js";
import {
  createToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";
import { refreshCookieOptions } from "../utils/cookies.js";
import jwt from "jsonwebtoken";

export const addlawyer = async (req, res) => {
  try {
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    // Parse address if it's a string
    if (req.body.address && typeof req.body.address === "string") {
      try {
        req.body.address = JSON.parse(req.body.address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid address format. Address must be a valid JSON object",
        });
      }
    }

    // validate request body
    const validatedData = await addLawyerByAdminSchema.parseAsync(req.body);
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = validatedData;

    // check if lawyer with the same email already exists
    const existingLawyer = await lawyerModel.findOne({
      email: validatedData.email,
    });
    if (existingLawyer) {
      return res
        .status(400)
        .json({ message: "Lawyer with this email already exists" });
    }

    // hashing password
    const { salt, password: hashedPassword } =
      await hashPasswordWithSalt(password);

    // Upload image to Cloudinary using buffer and upload_stream
    const imageUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        },
      );
      uploadStream.end(imageFile.buffer);
    });

    // create new lawyer
    const newLawyer = new lawyerModel({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: {
        Location: address.Location || "",
        City: address.City || "",
        State: address.State || "",
      },
      date: Date.now(),
    });

    // save lawyer to database
    await newLawyer.save();
    res
      .status(201)
      .json({ success: true, message: "Lawyer added successfully" });
  } catch (error) {
    // console.error("Error adding lawyer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const validationResult = loginPostRequestBodySchema.safeParse(req.body);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.format(),
        success: false,
      });
    }

    const { email, password } = validationResult.data;

    // check against env credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // admin JWT payload
    const adminPayload = {
      id: email,
      role: "admin",
    };

    // access token (short lived)
    const accessToken = generateAccessToken(adminPayload);

    // refresh token (long lived)
    const refreshToken = generateRefreshToken(adminPayload);

    // set refresh token cookie
    res.cookie("adminRefreshToken", refreshToken, refreshCookieOptions);

    // admin profile data
    const adminProfile = {
      id: email,
      email: email,
      role: "admin",
      name: "Admin",
    };

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      accessToken,
      admin: adminProfile,
    });
  } catch (error) {
    // console.error("Error during admin login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllLawyers = async (req, res) => {
  try {
    // Explicit allowlist — ensures refreshToken, date, and any future
    // internal fields are never accidentally sent to the admin frontend.
    const lawyers = await lawyerModel
      .find()
      .select(
        "_id name email image speciality degree experience about available fees address slots_booked",
      );
    res.status(200).json({ success: true, lawyers });
  } catch (error) {
    // console.error("Error fetching lawyers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin function to change lawyer availability
export const changeAvailability = async (req, res) => {
  try {
    const { lawyerId } = req.body;

    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: "Lawyer ID is required",
      });
    }

    const lawyer = await lawyerModel.findById(lawyerId);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    lawyer.available = !lawyer.available;
    await lawyer.save();

    res.status(200).json({
      success: true,
      message: `Lawyer is now ${lawyer.available ? "available" : "unavailable"}`,
    });
  } catch (error) {
    // console.error("Error changing availability:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const raw = await appointmentModel
      .find()
      .select(
        "slotDate slotTime amount payment isCompleted cancelled createdAt " +
          "userId lawyerId userData lawyerData videoCall",
      )
      .sort({ createdAt: -1 })
      .lean();

    const appointments = raw.map((appt) => {
      const ud = appt.userData || {};
      const ld = appt.lawyerData || {};

      return {
        id: appt._id,
        slotDate: appt.slotDate,
        slotTime: appt.slotTime,
        amount: appt.amount,
        payment: appt.payment,
        isCompleted: appt.isCompleted,
        cancelled: appt.cancelled,
        createdAt: appt.createdAt,

        videoCall: appt.videoCall
          ? {
              status: appt.videoCall.status ?? "not_started",
              duration: appt.videoCall.duration ?? 0,
              startedAt: appt.videoCall.startedAt ?? null,
              endedAt: appt.videoCall.endedAt ?? null,
            }
          : null,

        user: {
          id: appt.userId,
          name: ud.name ?? null,
          image: ud.image && ud.image.startsWith("http") ? ud.image : null,
        },

        lawyer: {
          id: appt.lawyerId,
          name: ld.name ?? null,
          speciality: ld.speciality ?? null,
          image: ld.image && ld.image.startsWith("http") ? ld.image : null,
        },
      };
    });

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    // console.error("Error fetching appointments:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// api to cancel any appointment by admin

export const cancelAppointmentByAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    // check if appointment exists
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // check if appointment is already cancelled
    if (appointment.cancelled === "Cancelled by User") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled by User",
      });
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        cancelled: "Cancelled by Admin",
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully by Admin",
    });
  } catch (error) {
    // console.error("Error cancelling appointment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const adminDashboard = async (req, res) => {
  try {
    // Run all counts + latest appointments fetch in parallel
    const [lawyersCount, appointmentsCount, usersCount, latestRaw] =
      await Promise.all([
        lawyerModel.countDocuments(),
        appointmentModel.countDocuments(),
        UserModel.countDocuments(),
        appointmentModel
          .find()
          // userId and lawyerId are stored as String, not ObjectId refs,
          // so .populate() is not available — use embedded snapshots safely
          .select(
            "slotDate slotTime amount payment isCompleted cancelled createdAt " +
              "userId lawyerId userData lawyerData videoCall",
          )
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    // Manually shape each appointment — never return raw docs
    const latestAppointments = latestRaw.map((appt) => {
      const ud = appt.userData || {};
      const ld = appt.lawyerData || {};

      return {
        id: appt._id,
        slotDate: appt.slotDate,
        slotTime: appt.slotTime,
        amount: appt.amount,
        payment: appt.payment,
        isCompleted: appt.isCompleted,
        cancelled: appt.cancelled,
        createdAt: appt.createdAt,

        videoCall: appt.videoCall
          ? {
              status: appt.videoCall.status ?? "not_started",
              duration: appt.videoCall.duration ?? 0,
              startedAt: appt.videoCall.startedAt ?? null,
              endedAt: appt.videoCall.endedAt ?? null,
            }
          : null,

        // Safe user snapshot — name + URL image only, nothing sensitive
        user: {
          id: appt.userId,
          name: ud.name ?? null,
          image: ud.image && ud.image.startsWith("http") ? ud.image : null,
        },

        // Safe lawyer snapshot — no password, no refreshToken, no slots_booked
        lawyer: {
          id: appt.lawyerId,
          name: ld.name ?? null,
          speciality: ld.speciality ?? null,
          image: ld.image && ld.image.startsWith("http") ? ld.image : null,
        },
      };
    });

    return res.status(200).json({
      success: true,
      dashData: {
        lawyers: lawyersCount,
        appointments: appointmentsCount,
        patients: usersCount,
        latestAppointments,
      },
    });
  } catch (error) {
    // console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin refresh token endpoint
export const refreshAdminAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Admin refresh token missing",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Admin refresh token expired or invalid",
      });
    }

    // Verify it's an admin token
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    // minimal payload
    const payload = {
      id: decoded.id,
      role: "admin",
    };

    const newAccessToken = generateAccessToken(payload);

    // admin profile data
    const adminProfile = {
      id: decoded.id,
      email: decoded.id,
      role: "admin",
      name: "Admin",
    };

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      admin: adminProfile,
    });
  } catch (error) {
    // console.error("Admin refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not refresh admin access token",
    });
  }
};

// Admin logout endpoint
export const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("adminRefreshToken", {
      ...refreshCookieOptions,
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
