import api from "./axiosClient";

// GET user appointments
export const getUserAppointments = async () => {
  return api.get("/api/user/appointments");
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
