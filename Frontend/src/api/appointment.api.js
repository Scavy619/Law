import api from "./axiosClient";

// GET user appointments
export const getUserAppointments = async (page = 1, limit = 7, status = "") => {
  let url = `/api/user/appointments?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  return api.get(url);
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
