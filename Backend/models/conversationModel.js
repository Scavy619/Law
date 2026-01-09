import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",   // like foreign key we refer to user model
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      // unique: true,
    },
    title: {
      type: String,
      default: null,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
conversationSchema.index({ userId: 1 });
conversationSchema.index({ updatedAt: -1 });



const conversationModel = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
export default conversationModel;