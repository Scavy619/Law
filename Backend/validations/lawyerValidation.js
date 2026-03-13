import { z } from "zod";

export const lawyerLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updatePatchRequestBodySchemaForLawyer = z.object({
  fees: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),

  address: z
    .union([
      z.string(), // for FormData cases
      z.object({
        Location: z.string().optional(),
        City: z.string().optional(),
        State: z.string().optional(),
      }),
    ])
    .optional(),

  available: z
    .union([z.boolean(), z.string().transform((val) => val === "true")])
    .optional(),

  about: z
    .string()
    .min(20, "About section must be at least 20 characters long")
    .optional(),
});

export const lawyerAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
});
