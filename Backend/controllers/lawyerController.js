import lawyerModel from "../models/lawyerModel.js";
import appointmentModel from "../models/appointmentModel.js";
import {
  loginPostRequestBodySchema,
  updatePatchRequestBodySchemaForLawyer,
} from "../validations/reqValidation.js";
import { verifyPassword } from "../utils/hash.js";
import mongoose from "mongoose";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { refreshCookieOptions } from "../utils/cookies.js";
import jwt from "jsonwebtoken";

export const changeAvailability = async (req, res) => {
  try {
    const lawyerId = req.lawyer.id;

    const lawyer = await lawyerModel.findById(lawyerId);

    if (!lawyer) {
      return res
        .status(404)
        .json({ success: false, message: "Lawyer not found" });
    }

    lawyer.available = !lawyer.available;

    await lawyer.save();

    res.status(200).json({
      success: true,
      message: `Lawyer is now ${lawyer.available ? "available" : "unavailable"}`,
    });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to get lawyer list for frontend

export const getLawyerList = async (req, res) => {
  try {
    // TODO:
    // - Add pagination (page & limit via query params)
    // - Filter only available lawyers if required by frontend
    // - Select only required fields for better performance

    const lawyers = await lawyerModel.find({}).select("-password");
    res.status(200).json({ success: true, lawyers });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to login lawyer
export const lawyerLogin = async (req, res) => {
  try {
    const validationResult = loginPostRequestBodySchema.safeParse(req.body);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.format(),
        success: false,
      });
    }

    const { email, password } = validationResult.data;

    const lawyer = await lawyerModel.findOne({ email });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    const isPasswordValid = await verifyPassword(password, lawyer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // access token (short lived)
    const accessToken = generateAccessToken({
      id: lawyer._id.toString(),
    });

    // refresh token (long lived)
    const refreshToken = generateRefreshToken({
      id: lawyer._id.toString(),
    });

    // set refresh token cookie
    res.cookie("lawyerRefreshToken", refreshToken, refreshCookieOptions);

    // lawyer profile data (without sensitive info)
    const lawyerProfile = {
      _id: lawyer._id,
      name: lawyer.name,
      email: lawyer.email,
      image: lawyer.image,
      speciality: lawyer.speciality,
      degree: lawyer.degree,
      experience: lawyer.experience,
      about: lawyer.about,
      fees: lawyer.fees,
      address: lawyer.address,
      available: lawyer.available,
    };

    return res.status(200).json({
      success: true,
      message: "Lawyer logged in successfully",
      accessToken,
      lawyer: lawyerProfile,
    });
  } catch (error) {
    // console.error("Error during lawyer login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// api to get lawyer appointments
export const getLawyerAppointments = async (req, res) => {
  try {
    const lawyerId = req.lawyer.id;

    const appointments = await appointmentModel.find({ lawyerId });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to cancel appointment by lawyer
export const cancelAppointmentByLawyer = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const lawyerId = req.lawyer.id;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.lawyerId.toString() !== lawyerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    if (appointment.cancelled === "Cancelled by User") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled by User",
      });
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { cancelled: "Cancelled by Lawyer" },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully by Lawyer",
      appointment: updatedAppointment,
    });
  } catch (error) {
    // console.error("Error cancelling appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// apit to mark appointment as completed by lawyer
export const appointmentCompletedByLawyer = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const lawyerId = req.lawyer.id;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.lawyerId.toString() !== lawyerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    if (appointment.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Appointment already completed",
      });
    }

    await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { isCompleted: true },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
    });
  } catch (error) {
    // console.error("Error completing appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// api to get lawyer profile
export const getLawyerProfile = async (req, res) => {
  try {
    const lawyerId = req.lawyer.id;

    // if(!lawyerId){
    //     return res.status(400).json({ success: false, message: "Lawyer ID is required" })
    // }

    const lawyer = await lawyerModel.findById(lawyerId).select("-password");

    if (!lawyer) {
      return res
        .status(404)
        .json({ success: false, message: "Lawyer not found" });
    }

    res.status(200).json({ success: true, profileData: lawyer });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to update lawyer profile
export const updateLawyerProfile = async (req, res) => {
  try {
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

    // Parse available if it's a string
    if (req.body.available && typeof req.body.available === "string") {
      req.body.available = req.body.available === "true";
    }

    // Parse fees if it's a string
    if (req.body.fees && typeof req.body.fees === "string") {
      const feesNumber = Number(req.body.fees);
      if (isNaN(feesNumber)) {
        return res.status(400).json({
          success: false,
          message: "Fees must be a valid number",
        });
      }
      req.body.fees = feesNumber;
    }

    // Validate body (WITHOUT lawyerId)
    const validationResult =
      await updatePatchRequestBodySchemaForLawyer.safeParseAsync(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: validationResult.error.format(),
        success: false,
      });
    }

    const { fees, address, available, about } = validationResult.data;

    // lawyerId ONLY from auth middleware
    const lawyerId = req.lawyer.id;

    const updates = {};
    if (fees !== undefined) updates.fees = fees;
    if (address !== undefined) updates.address = address;
    if (available !== undefined) updates.available = available;
    if (about !== undefined) updates.about = about;

    const updatedLawyer = await lawyerModel.findByIdAndUpdate(
      lawyerId,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedLawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      lawyer: updatedLawyer,
    });
  } catch (error) {
    // console.error("Error in updateLawyerProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// api to get data for lawyer dashboard

export const lawyerDashboard = async (req, res) => {
  try {
    const lawyerId = req.lawyer.id;

    const [result] = await appointmentModel.aggregate([
      {
        $match: {
          lawyerId: lawyerId,
        },
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                totalAppointments: { $sum: 1 },
                totalEarnings: {
                  $sum: {
                    $cond: [
                      { $and: ["$isCompleted", "$payment"] },
                      "$amount",
                      0,
                    ],
                  },
                },
                uniquePatients: { $addToSet: "$userId" },
              },
            },
          ],
          latestAppointments: [
            {
              $addFields: {
                sortDate: {
                  $ifNull: ["$createdAt", { $toDate: "$date" }],
                },
              },
            },
            { $sort: { sortDate: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const stats = result.stats[0] || {};

    res.status(200).json({
      success: true,
      dashData: {
        earnings: stats.totalEarnings || 0,
        appointments: stats.totalAppointments || 0,
        patients: stats.uniquePatients?.length || 0,
        latestAppointments: result.latestAppointments || [],
      },
    });
  } catch (error) {
    // console.error("Lawyer dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lawyer refresh token endpoint
export const refreshLawyerAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.lawyerRefreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Lawyer refresh token missing",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Lawyer refresh token expired or invalid",
      });
    }

    // minimal payload
    const payload = {
      id: decoded.id,
    };

    const newAccessToken = generateAccessToken(payload);

    // Fetch lawyer data to send with the response
    const lawyer = await lawyerModel.findById(decoded.id).select("-password");

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    // lawyer profile data
    const lawyerProfile = {
      _id: lawyer._id,
      name: lawyer.name,
      email: lawyer.email,
      image: lawyer.image,
      speciality: lawyer.speciality,
      degree: lawyer.degree,
      experience: lawyer.experience,
      about: lawyer.about,
      fees: lawyer.fees,
      address: lawyer.address,
      available: lawyer.available,
    };

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      lawyer: lawyerProfile,
    });
  } catch (error) {
    // console.error("Lawyer refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not refresh lawyer access token",
    });
  }
};

// Lawyer logout endpoint
export const logoutLawyer = async (req, res) => {
  try {
    res.clearCookie("lawyerRefreshToken", {
      ...refreshCookieOptions,
    });

    return res.status(200).json({
      success: true,
      message: "Lawyer logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
