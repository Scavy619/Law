import express from "express";
import authUser from "../middleware/authUser.js";
import { upload } from "../middleware/multer.js";
import {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  requestDeleteAccountOtp,
  verifyDeleteAccountOtp,
  verify2FA,
  setup2FA,
  disable2FA
} from "../controllers/userController.js";
const userRouter = express.Router();

// signup and login routes
userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email/:token", verifyEmail);

// forgot password routes
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);

// fetch user profile or  update it
userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.patch(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateUserProfile,
);

// resending verification email
userRouter.post("/resend-verification", resendVerificationEmail);

// Account deletion
userRouter.post("/delete-account/request", authUser, requestDeleteAccountOtp);
userRouter.post("/delete-account/verify", authUser, verifyDeleteAccountOtp);

// appointment and online payment related paths
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verify-razorpay", authUser, verifyRazorpay);

// 2FA based
// initiate 2FA setup (generate secret + QR)
userRouter.post("/2fa/setup", authUser, setup2FA);

// verify OTP and enable 2FA
userRouter.post("/2fa/verify", authUser, verify2FA);

// disable 2fa
userRouter.post("/2fa/disable", authUser, disable2FA)

export default userRouter;
