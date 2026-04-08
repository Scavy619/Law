// Backend/controllers/videoController.js

import appointmentModel from "../models/appointmentModel.js";
import {
  generateStreamToken,
  createVideoCall,
  endVideoCall,
} from "../config/streamService.js";
import {
  videoTokenSchema,
  updateCallStatusSchema,
} from "../validations/videoValidation.js";
import {
  scheduleCallEndJob,
  cancelCallEndJob,
} from "../bullmq/jobs/videoJobs.js";

/**
 * Generate Stream token for user
 * Endpoint: POST /api/video/get-token
 */

const getAppointmentDateTime = (appointment) => {
  const [day, month, year] = appointment.slotDate.split("_");

  const dateTimeString = `${year}-${month}-${day} ${appointment.slotTime}`;

  return new Date(dateTimeString);
};

export const getVideoToken = async (req, res) => {
  try {
    const validationResult = videoTokenSchema.safeParse(req.body);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.format(),
        success: false,
      });
    }

    const { appointmentId } = validationResult.data;
    const userId = req.user?.id || req.lawyer?.id;

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Verify user is part of appointment
    const isUser = appointment.userId.toString() === userId;
    const isLawyer = appointment.lawyerId.toString() === userId;

    if (!isUser && !isLawyer) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    // 3 checks - payment check -> appointment check -> Time join window check (15 minutes pehle hi join kar skta hai user appointment time ke)
    // Check if appointment is paid
    if (!appointment.payment) {
      return res
        .status(403)
        .json({ success: false, message: "Appointment not paid" });
    }

    // Check if appointment is not cancelled
    if (appointment.cancelled && appointment.cancelled !== "Not Cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Appointment cancelled" });
    }

    const now = new Date();
    const slotStart = getAppointmentDateTime(appointment);

    // can join before 15 minutes of start time
    const joinStart = new Date(slotStart.getTime() - 15 * 60 * 1000);

    // assuming slot duration = 30 minutes
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

    // meeting expires 10 minutes after slot end
    const expiryTime = new Date(slotEnd.getTime() + 10 * 60 * 1000);

    // Prevent joining completed call
    if (appointment.videoCall?.status === "completed") {
      return res.status(403).json({
        success: false,
        message: "This call has already ended",
      });
    }

    // Too early
    if (now < joinStart) {
      return res.status(403).json({
        success: false,
        message:
          "Video call can only be joined 15 minutes before the appointment",
      });
    }

    // Meeting expired
    if (now > expiryTime) {
      return res.status(403).json({
        success: false,
        message: "This meeting has expired",
      });
    }

    // Get user name
    const userName = isUser
      ? appointment.userData.name
      : appointment.lawyerData.name;

    // Generate Stream token
    const token = await generateStreamToken(userId, userName);

    // Create video call if not exists
    let callId = appointment.videoCall.callId;
    if (!callId) {
      callId = `appointment_${appointmentId}`;
      try {
        await createVideoCall(callId, appointment.userId, appointment.lawyerId);

        // Update appointment with call details
        appointment.videoCall.callId = callId;
        appointment.videoCall.roomId = callId;
        await appointment.save();
      } catch (createError) {
        // console.error('Call creation error:', createError);
        // If call creation fails, we can still proceed -
        // Stream allows calls to be created on join with proper settings
        appointment.videoCall.callId = callId;
        appointment.videoCall.roomId = callId;
        await appointment.save();
      }
    }

    res.json({
      success: true,
      token,
      callId: appointment.videoCall.callId,
      apiKey: process.env.STREAM_API_KEY,
      userId,
    });
  } catch (error) {
    // console.error('Get video token error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update video call status (join/leave)
 * Endpoint: POST /api/video/update-status
 */

// Currently billing stops only if both participants leave.
// So best way is to add in future -> slotEnd + 10 min → force end call which will be impleneted using BULLMQ
export const updateCallStatus = async (req, res) => {
  try {
    const validationResult = updateCallStatusSchema.safeParse(req.body);

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.format(),
        success: false,
      });
    }

    const { appointmentId, action } = validationResult.data;
    const userId = req.user?.id || req.lawyer?.id;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const isUser = appointment.userId.toString() === userId;
    const isLawyer = appointment.lawyerId.toString() === userId;

    switch (action) {
      case "join":
        if (isUser) appointment.videoCall.userJoined = true;
        if (isLawyer) appointment.videoCall.lawyerJoined = true;

        // Start call when first person joins
        if (!appointment.videoCall.startedAt) {
          appointment.videoCall.startedAt = new Date();
          appointment.videoCall.status = "in_progress";

          await scheduleCallEndJob(appointment);
        }
        break;

      case "leave": {
        if (isUser) appointment.videoCall.userJoined = false;
        if (isLawyer) appointment.videoCall.lawyerJoined = false;

        // End call when both have left
        if (
          !appointment.videoCall.userJoined &&
          !appointment.videoCall.lawyerJoined
        ) {
          appointment.videoCall.endedAt = new Date();
          appointment.videoCall.status = "completed";

          // Calculate duration
          const duration = Math.round(
            (appointment.videoCall.endedAt - appointment.videoCall.startedAt) /
              60000,
          );
          appointment.videoCall.duration = duration;

          // End call on Stream
          await endVideoCall(appointment.videoCall.callId);
          await cancelCallEndJob(appointmentId);
        }
        break;
      }

      case "end": {
        appointment.videoCall.endedAt = new Date();
        appointment.videoCall.status = "completed";
        appointment.videoCall.userJoined = false;
        appointment.videoCall.lawyerJoined = false;

        const duration = Math.round(
          (appointment.videoCall.endedAt - appointment.videoCall.startedAt) /
            60000,
        );
        appointment.videoCall.duration = duration;

        await endVideoCall(appointment.videoCall.callId);
        await cancelCallEndJob(appointmentId);
        break;
      }
    }

    await appointment.save();

    res.json({ success: true, message: "Call status updated" });
  } catch (error) {
    // console.error('Update call status error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get call details
 * Endpoint: GET /api/video/call-details/:appointmentId
 */
export const getCallDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user?.id || req.lawyer?.id;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const isUser = appointment.userId.toString() === userId;
    const isLawyer = appointment.lawyerId.toString() === userId;

    if (!isUser && !isLawyer) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    res.json({
      success: true,
      callDetails: appointment.videoCall,
      canJoin: appointment.payment && !appointment.cancelled,
    });
  } catch (error) {
    // console.error('Get call details error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
