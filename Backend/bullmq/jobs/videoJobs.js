import { videoQueue } from "../queues/videoQueues.js";

// job producer file

// we will add this job to queue when meeting starts
export const scheduleCallEndJob = async (appointment) => {
  if (!appointment.videoCall?.startedAt) return;

  const [day, month, year] = appointment.slotDate.split("_");
  const dateTimeString = `${year}-${month}-${day}T${appointment.slotTime}:00+05:30`;
  const slotStart = new Date(dateTimeString);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

  const delay = Math.max(slotEnd.getTime() - Date.now(), 0);

  const job = await videoQueue.add(
    "end-call",
    { appointmentId: appointment._id },
    {
      delay,
      jobId: `end-call-${appointment._id}`,
    },
  );

  return job;
};

// suppose user ends call before 30 minutes then we need to remove that job since meeting has already been ended
export const cancelCallEndJob = async (appointmentId) => {
  const jobId = `end-call-${appointmentId}`;

  const job = await videoQueue.getJob(jobId);

  if (job) {
    await job.remove();
    console.log("Job cancelled:", jobId);
  }
};
