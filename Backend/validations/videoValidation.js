import { z } from "zod";

export const videoTokenSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
});

export const updateCallStatusSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  action: z.enum(["join", "leave", "end"], {
    errorMap: () => ({ message: "Action must be 'join', 'leave', or 'end'" }),
  }),
});
