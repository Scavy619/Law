import mongoose from "mongoose";

// This model is for user ke saare uploaded documents ka permanent record
const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "docx", "txt", "image"],
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    chunksStored: {
      type: Number,
      required: true,
    },
    pineconeNamespace: {
      type: String,
      required: true,
    },
    // Daily upload limit track karne ke liye
    uploadDate: {
      type: String, // "YYYY-MM-DD" format — easy daily count ke liye
      required: true,
    },
  },
  { timestamps: true },
);

// Ek user ke saare documents fetch karne ke liye
documentSchema.index({ userId: 1 });

// Daily limit check ke liye — userId + uploadDate
documentSchema.index({ userId: 1, uploadDate: 1 });

const documentModel =
  mongoose.models.document || mongoose.model("document", documentSchema);

export default documentModel;
