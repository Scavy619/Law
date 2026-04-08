import "dotenv/config";
import { Worker } from "bullmq";
import redis from "../../config/redis.js";
import Appointment from "../../models/appointmentModel.js";
import streamClient from "../../config/streamService.js";
import { connectMongoDB } from "../../config/mongodb.js";

await connectMongoDB(process.env.MONGODB_URI);
console.log("Mongo DB Connected in worker!!");

const worker = new Worker(
  "video-call",
  async (job) => {
    if (job.name === "end-call") {
      const { appointmentId } = job.data;
      console.log(
        `[Job ${job.id}] Starting end-call for appointment: ${appointmentId}`,
      );

      try {
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
          console.log(
            `[Job ${job.id}] Appointment not found: ${appointmentId}`,
          );
          return;
        }

        // 2. Idempotent check
        if (appointment.videoCall?.status === "completed") {
          console.log(
            `[Job ${job.id}] Call already completed. Idempotent return.`,
          );
          return; // Return safely without crashing
        }

        const callId =
          appointment.videoCall?.callId ||
          appointment.videoCall?.roomId ||
          `appointment_${appointmentId}`;

        // 2. If callId or roomId is missing, skip Stream call
        if (appointment.videoCall?.callId || appointment.videoCall?.roomId) {
          try {
            const call = streamClient.video.call("default", callId);
            await call.end();
            console.log(
              `[Job ${job.id}] Stream call ended successfully: ${callId}`,
            );
          } catch (err) {
            console.error(
              `[Job ${job.id}] Stream end error for ${callId}:`,
              err.message,
            );
            // Don't throw here; we still want to mark it completed in the DB
          }
        } else {
          console.log(
            `[Job ${job.id}] No valid callId/roomId found. Skipping Stream API end call.`,
          );
        }

        // Always update DB safely
        appointment.videoCall.status = "completed";
        appointment.videoCall.endedAt = new Date();

        if (appointment.videoCall.startedAt) {
          const duration =
            (appointment.videoCall.endedAt.getTime() -
              new Date(appointment.videoCall.startedAt).getTime()) /
            (1000 * 60);
          appointment.videoCall.duration = Math.max(0, Math.round(duration));
        }

        await appointment.save();
        console.log(
          `[Job ${job.id}] Successfully auto-ended call in DB: ${appointmentId}`,
        );
      } catch (error) {
        // 1. Log full error stack and trigger retry handling
        console.error(
          `[Job ${job.id}] Fatal error executing job:`,
          error.stack,
        );
        throw error;
      }
    }
  },
  {
    connection: redis,
    concurrency: 5,
    // 3. Retry handling and 4. Clean up jobs safely
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
);

export default worker;
