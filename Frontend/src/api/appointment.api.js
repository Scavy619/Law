import api from "./axiosClient";

// GET user appointments
export const getUserAppointments = async (
  page = 1,
  limit = 7,
  status = "",
  filters = {},
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) params.set("status", status);

  const { sortOrder = "desc", lawyerName = "", fromDate = "", toDate = "" } =
    filters;

  if (sortOrder) params.set("sortOrder", sortOrder);
  if (lawyerName) params.set("lawyerName", lawyerName);
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);

  return api.get(`/api/user/appointments?${params.toString()}`);
};

// CANCEL appointment
export const cancelAppointment = async (appointmentId) => {
  return api.post("/api/user/cancel-appointment", {
    appointmentId,
  });
};

// BOOK appointment - UNUSED IN NEW FLOW
// export const bookAppointment = async (lawyerId, slotDate, slotTime) => {
//   return api.post("/api/user/book-appointment", {
//     lawyerId,
//     slotDate,
//     slotTime,
//   });
// };

// Create Payment Order
export const createPaymentOrder = async (lawyerId, slotDate, slotTime) => {
  return api.post("/api/user/create-payment-order", {
    lawyerId,
    slotDate,
    slotTime,
  });
};

// Verify Payment and Create Appointment
export const verifyPaymentAndCreateAppointment = async (paymentData) => {
  return api.post(
    "/api/user/verify-payment-and-create-appointment",
    paymentData,
  );
};
