import express from "express";
import {
  uploadDocument,
  getUserDocuments,
} from "../controllers/documentController.js";
import authUser from "../middleware/authUser.js";
import { uploadDocument as uploadDocumentMiddleware } from "../middleware/multer.js";

const documentRouter = express.Router();

// Upload a document — auth + multer
documentRouter.post(
  "/upload",
  authUser,
  uploadDocumentMiddleware.single("file"),
  uploadDocument,
);

// Get all documents for the logged in user
documentRouter.get("/", authUser, getUserDocuments);

export default documentRouter;
