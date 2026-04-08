import { QueueEvents } from "bullmq";
import redis from "../../config/redis.js";


// QueueEvents ka use job lifecycle events (completed, failed, etc.) ko listen karne ke liye hota hai
const queueEvents = new QueueEvents("video-call", {
  connection: redis,
});

queueEvents.on("completed", ({ jobId }) => {
  console.log(`Job completed: ${jobId}`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job failed: ${jobId}`, failedReason);
});
