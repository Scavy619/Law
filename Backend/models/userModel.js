import mongoose from "mongoose";
import { type } from "node:os";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/dcvbky2xa/image/upload/v1772559451/default-img_zgazcn.png",
  },
  phone: { type: String, default: "0000000000" },
  address: { type: Object, default: { Location: "", City: "", State: "" } },
  gender: { type: String, default: "Not Selected" },
  dob: { type: String, default: "Not Selected" },
  password: { type: String, required: true },

  // email verification things
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpiry: { type: Date },

  // forgot password things
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },

  // deletion OTP things
  deleteOtp: { type: String },
  deleteOtpExpiresAt: { type: Date },

  refreshToken: {
    type: String,
  },

  // 2FA
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },

  twoFactorSecret: {
    type: String, // base32 secret
    default: null,
  },

  // chatbot credits
  credits: {
    dailyLimit: {
      type: Number,
      default: 10,
    },
    remaining: {
      type: Number,
      default: 10,
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
});

// checking if model already exists (to avoid recompilation error in dev env)
const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
