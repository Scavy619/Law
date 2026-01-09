// Backend/routes/videoRoute.js

import express from "express";
import {
  getVideoToken,
  updateCallStatus,
  getCallDetails,
} from "../controllers/videoController.js";
import { verifyAccessToken } from "../utils/token.js";

const videoRouter = express.Router();

// Middleware to accept both user and lawyer tokens
const authUserOrLawyer = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required. Please provide a valid Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    // Set both req.user and req.lawyer for compatibility
    // The controller will check which one matches the appointment
    req.user = { id: decoded.id };
    req.lawyer = { id: decoded.id };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access token expired or invalid. Please login again.",
    });
  }
};

// Get Stream token and call details
videoRouter.post("/get-token", authUserOrLawyer, getVideoToken);

// Update call status (join/leave/end)
videoRouter.post("/update-status", authUserOrLawyer, updateCallStatus);

// Get call details
videoRouter.get(
  "/call-details/:appointmentId",
  authUserOrLawyer,
  getCallDetails,
);

export default videoRouter;
