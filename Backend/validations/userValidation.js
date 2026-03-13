import { z } from "zod";

export const signupPostRequestBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must contain uppercase, lowercase, number and special character",
    ),
});

export const loginPostRequestBodySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6),
  twoFactorCode: z.string().optional(),
});

export const updatePatchRequestBodySchemaforUser = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),

  phone: z
    .string()
    .refine((val) => val === "" || /^[0-9]{10}$/.test(val), {
      message: "Phone must be a valid 10-digit number or empty",
    })
    .optional(),

  dob: z
    .string()
    .refine(
      (val) =>
        val === "" || val === "Not Selected" || /^\d{4}-\d{2}-\d{2}$/.test(val),
      {
        message:
          "Date of Birth must be in YYYY-MM-DD format, 'Not Selected', or empty",
      },
    )
    .optional(),

  gender: z
    .enum(["Male", "Female", "Others", "Not Selected", "Rather Not Say"])
    .optional(),

  address: z
    .union([
      z.string(), // in case frontend sends JSON string (FormData)
      z.object({
        Location: z.string().optional(),
        City: z.string().optional(),
        State: z.string().optional(),
      }),
    ])
    .optional(),
});

export const verify2FASchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "2FA code must be exactly 6 digits")
    .regex(/^\d{6}$/, "2FA code must contain only digits"),
});

export const resetPasswordPostRequestBodySchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must contain uppercase, lowercase, number and special character",
    ),
});

export const bookAppointmentSchema = z.object({
  lawyerId: z.string().min(1, "Lawyer ID is required"),
  slotDate: z.string().min(1, "Slot Date is required"),
  slotTime: z.string().min(1, "Slot Time is required"),
});

export const emailOnlySchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
});

export const verifyRazorpaySchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z
    .string()
    .length(6, "2FA code must be exactly 6 digits")
    .regex(/^\d{6}$/, "2FA code must contain only digits"),
});

export const verifyDeleteAccountOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});
