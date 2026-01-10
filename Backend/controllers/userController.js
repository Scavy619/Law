import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
  updatePatchRequestBodySchemaforUser,
  resetPasswordPostRequestBodySchema,
} from "../validations/reqValidation.js";
import userModel from "../models/userModel.js";
import lawyerModel from "../models/lawyerModel.js";
import appointmentModel from "../models/appointmentModel.js";
import crypto from "crypto";
import { generateCryptoToken } from "../utils/cryptoToken.js";
import { sendEmail } from "../services/mailService.js";
import {
  verifyEmailTemplate,
  resetPasswordTemplate,
  deleteAccountOtpTemplate,
} from "../services/emailTemplates.js";
import {
  hashPasswordWithSalt,
  verifyPassword,
  hashToken,
} from "../utils/hash.js";
import { createToken } from "../utils/token.js";
import { v2 as cloudinary } from "cloudinary";
import razorpay from "razorpay";
import conversationModel from "../models/conversationModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { refreshCookieOptions } from "../utils/cookies.js";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { TOTP, Secret } from "otpauth";

// creating user controller for signup

export const signupUser = async (req, res) => {
  try {
    const validationResult = await signupPostRequestBodySchema.safeParseAsync(
      req.body,
    );

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.format(),
        success: false,
      });
    }

    const { name, email, password } = validationResult.data;

    // check if user already exists with the same email
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "User already exists with the same email",
        success: false,
      });
    }

    // now hashing the password
    const { password: hashedPassword } = await hashPasswordWithSalt(password);

    // generate crypto token for verification
    const { rawToken, hashedToken } = generateCryptoToken();

    // now creating new user
    const new_user = new userModel({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    await new_user.save();

    // send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: verifyEmailTemplate(verifyLink),
    });

    // ab token create karna hai for that user
    // const token = await createToken({ id: new_user._id.toString() });
    // return res.status(201).json({
    //   message: "User created successfully",
    //   success: true,
    //   token,
    // });

    // token will be created only in login and emailVerified == true par
    return res.status(201).json({
      message: "Signup successful. Please verify your email.",
      success: true,
    });
  } catch (error) {
    // console.error("Error in signupUser:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      success: false,
    });
  }
};

// api to login user

const createTOTP = (secret) => {
  return new TOTP({
    issuer: "LawBridge",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret, // base32 string directly
  });
};

export const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "2FA already enabled",
      });
    }

    // Generate secret (base32)
    const secret = new Secret({ size: 20 }); // 160-bit
    const base32Secret = secret.base32;

    // Create TOTP instance
    const totp = new TOTP({
      issuer: "LawBridge",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: base32Secret,
    });

    // Generate otpauth URI
    const otpauthUrl = totp.toString();

    // Save secret in DB
    user.twoFactorSecret = base32Secret;
    await user.save();

    // Generate QR
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    return res.status(200).json({
      success: true,
      qrCode,
      manualKey: base32Secret, // fallback manual entry
    });
  } catch (error) {
    console.error("Error in setup2FA:", error);

    return res.status(500).json({
      success: false,
      message: "Could not setup 2FA",
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    // console.log("Login request received:", { email: req.body.email });

    // validation of request
    const validationResult = await loginPostRequestBodySchema.safeParseAsync(
      req.body,
    );

    if (validationResult.error) {
      // console.error("Login validation error:", validationResult.error);
      return res.status(400).json({
        success: false,
        error: validationResult.error.format(),
      });
    }

    const { email, password, twoFactorCode } = validationResult.data;

    // checking if user exists
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User does not exist with the given email",
      });
    }

    // email verified pe ae kaam chlega
    if (!existingUser.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        action: "RESEND VERIFICATION EMAIL",
      });
    }

    // verifying password
    const isPasswordValid = await verifyPassword(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 2FA check: if enabled, require and verify TOTP code
    if (existingUser.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: true,
          requires2FA: true,
          message: "2FA code required",
        });
      }

      // Verify 2FA code using otpauth
      const totp = createTOTP(existingUser.twoFactorSecret);
      const delta = totp.validate({ token: twoFactorCode, window: 1 });

      if (delta === null) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired 2FA code",
        });
      }
    }

    // generating the access token and refresh token
    const accessToken = generateAccessToken({
      id: existingUser._id,
    });

    const refreshToken = generateRefreshToken({
      id: existingUser._id,
    });

    // store the hashed refresh token in DB
    existingUser.refreshToken = await hashToken(refreshToken);
    await existingUser.save({ validateBeforeSave: false });

    // console.log("Login successful, sending response with cookie");

    // sending refresh token as cookie
    return res
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        accessToken,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
          phone: existingUser.phone,
          address: existingUser.address,
          gender: existingUser.gender,
          dob: existingUser.dob,
        },
      });
  } catch (error) {
    // console.error("Error in loginUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// verification of email
export const verifyEmail = async (req, res) => {
  try {
    // becoz zod changed it to obj
    const token = String(req.params.token);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    res.status(201).json({ message: "Email Verified Successfully!!!" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    // TODO - Email verification mein agar purana link expire na hua ho toh agla mat bhejo
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        success: false,
      });
    }

    // prevent spamming of resend of verification mail by checking this
    if (
      user.emailVerificationExpiry &&
      user.emailVerificationExpiry > Date.now()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Verification email already sent. Please check your inbox or try again later.",
      });
    }

    const { rawToken, hashedToken } = generateCryptoToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: verifyEmailTemplate(verifyLink),
    });

    res.status(200).json({
      message: "Verification email resent",
      success: true,
    });
  } catch (error) {
    // console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// get user data for profile page
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// forgot password ie we will send reset link to the user if they exist
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    // Prevent email enumeration ie hacker baar baar mail behj k pata laga skta hai konsa acc hai ya nahi
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with this email exists, a reset link has been sent.",
      });
    }

    // Prevent spamming reset emails
    if (user.resetPasswordExpiry && user.resetPasswordExpiry > Date.now()) {
      return res.status(429).json({
        success: false,
        message:
          "A password reset email has already been sent. Please check your inbox.",
      });
    }

    const { rawToken, hashedToken } = generateCryptoToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: resetPasswordTemplate(resetLink),
    });

    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// now we will have to reset the password from the link sent by forgot password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    // validate the request
    const validationResult =
      await resetPasswordPostRequestBodySchema.safeParseAsync(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.format(),
      });
    }

    const { password } = validationResult.data;

    // hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find if request is valid
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // hash the new password
    const { password: hashedPassword } = await hashPasswordWithSalt(password);

    user.password = hashedPassword;

    // clear the reset password thangs
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    // invalidate all existing sessions
    user.refreshToken = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login again.",
    });
  } catch (error) {
    // console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const validationResult =
      await updatePatchRequestBodySchemaforUser.safeParseAsync(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error.format(),
        message: "Validation failed",
      });
    }

    const { name, phone, address, dob, gender } = validationResult.data;

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined && phone !== "") updates.phone = phone;
    if (dob !== undefined && dob !== "" && dob !== "Not Selected")
      updates.dob = dob;
    if (gender !== undefined) updates.gender = gender;

    // handling address
    if (address !== undefined) {
      if (typeof address === "string") {
        try {
          updates.address = JSON.parse(address);
        } catch {
          return res.status(400).json({
            success: false,
            message:
              "Invalid address format. Address must be a valid JSON object",
          });
        }
      } else {
        updates.address = address;
      }
    }

    // img upload handling
    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          },
        );
        uploadStream.end(req.file.buffer);
      });

      updates.image = imageUrl;
    }

    await userModel.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    // console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lawyerId, slotDate, slotTime } = req.body;

    if (!slotTime) {
      return res.status(400).json({
        success: false,
        message: "Please select slot time",
      });
    }

    if (!slotDate) {
      return res.status(400).json({
        success: false,
        message: "Please select appointment date",
      });
    }

    const lawyerData = await lawyerModel.findById(lawyerId).select("-password");

    if (!lawyerData.available) {
      // if lawyer is not available
      return res
        .status(400)
        .json({ success: false, message: "Lawyer Not Available" });
    }

    // get booked slots
    let slots_booked = lawyerData.slots_booked;

    // checking for slot availablity
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res
          .status(400)
          .json({ success: false, message: "Slot Not Available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      // if no slots booked on that date yet
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    // remove booked slots from lawyer data so frontend does not receive it so vo dikaaye hi na uss slot ko jo booked hai
    delete lawyerData.slots_booked;

    const appointmentData = {
      userId,
      lawyerId,
      userData,
      lawyerData,
      amount: lawyerData.fees,
      slotTime,
      slotDate,
      date: Date.now(), // when appointment was booked
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in lawyerData
    await lawyerModel.findByIdAndUpdate(lawyerId, { slots_booked });

    res.status(201).json({
      success: true,
      message: "Appointment Booked! Pay online to complete the booking!",
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to get user appointments for frontend my-appointments page
export const listAppointment = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const appointments = await appointmentModel
      .find({ userId })
      .sort({ date: -1 }); // Sort by date descending

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// api to cancel appointment from my-appointments page
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Authorization check
    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    // 🛑 If already cancelled
    if (appointmentData.cancelled === "Cancelled by User") {
      return res.status(400).json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    // cancel Appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: "Cancelled by User",
    });

    // release lawyer slots
    const { lawyerId, slotDate, slotTime } = appointmentData;

    const lawyerData = await lawyerModel.findById(lawyerId);

    if (lawyerData && lawyerData.slots_booked?.[slotDate]) {
      lawyerData.slots_booked[slotDate] = lawyerData.slots_booked[
        slotDate
      ].filter((time) => time !== slotTime);

      await lawyerModel.findByIdAndUpdate(lawyerId, {
        slots_booked: lawyerData.slots_booked,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    // console.error("Cancel appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// api to make payment for appointment

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (
      !appointmentData ||
      (appointmentData.cancelled &&
        appointmentData.cancelled !== "Not Cancelled")
    ) {
      return res.status(400).json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
    }

    // creating options for razorpay payment
    const options = {
      amount: appointmentData.amount * 100, // *100 to remove 2 decimal points
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to verify payment of razorpay
export const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.status(200).json({ success: true, message: "Payment Successful" });
    } else {
      res.status(400).json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete account routes

export const requestDeleteAccountOtp = async (req, res) => {
  try {
    // user identity ONLY from auth middleware
    const userId = req.user.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent OTP spamming
    if (user.deleteOtpExpiresAt && user.deleteOtpExpiresAt > Date.now()) {
      return res.status(429).json({
        success: false,
        message:
          "An OTP has already been sent. Please check your email or try again later.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.deleteOtp = hashedOtp;
    user.deleteOtpExpiresAt = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: "Confirm Account Deletion",
      html: deleteAccountOtpTemplate(otp),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    // console.error("Request delete account OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//now we need to verify that OTP
export const verifyDeleteAccountOtp = async (req, res) => {
  try {
    // user identity ONLY from auth middleware
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user || !user.deleteOtp) {
      return res.status(400).json({
        success: false,
        message: "No account deletion request found",
      });
    }

    if (user.deleteOtpExpiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.deleteOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // delete user-related data first
    await appointmentModel.deleteMany({ userId });
    await conversationModel.deleteMany({ userId });

    // delete user account
    await userModel.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    // console.error("Verify delete account OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Account deletion failed",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      ...refreshCookieOptions,
    });

    // console.log("Cleared refresh Token!");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired or invalid",
      });
    }

    // minimal payload only
    const payload = {
      id: decoded.id,
      // role: decoded.role,
    };

    const newAccessToken = generateAccessToken(payload);

    // Fetch user data to send with the response
    const user = await userModel
      .findById(decoded.id)
      .select(
        "-password -refreshToken -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordTokenExpiry -deleteAccountOtp -deleteAccountOtpExpiry",
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not refresh access token",
    });
  }
};

// 2FA


export const verify2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA setup not initiated",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "2FA code is required",
      });
    }

    const totp = createTOTP(user.twoFactorSecret);

    // otpauth returns delta (0 = valid, null = invalid)
    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired 2FA code",
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("Error in verify2FA:", error);

    return res.status(500).json({
      success: false,
      message: "Could not verify 2FA",
    });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, twoFactorCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "2FA is not enabled",
      });
    }

    if (!password || !twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: "Password and 2FA code are required",
      });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const totp = createTOTP(user.twoFactorSecret);
    const delta = totp.validate({ token: twoFactorCode, window: 1 });

    if (delta === null) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired 2FA code",
      });
    }

    // disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    console.error("Error in disable2FA:", error);

    return res.status(500).json({
      success: false,
      message: "Could not disable 2FA",
    });
  }
};
