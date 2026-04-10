import multer from "multer";

const storage = multer.memoryStorage();

// Profile pic img upload
export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG and PNG images are allowed"), false);
    }
  },
});

// Chatbot document upload
const ALLOWED_DOCUMENT_MIMETYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
};

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOCUMENT_MIMETYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type. Allowed: PDF, DOCX, TXT, JPG, PNG, WEBP",
        ),
        false,
      );
    }
  },
});
