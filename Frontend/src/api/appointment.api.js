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

// BOOK appointment
export const bookAppointment = async (
  lawyerId,
  slotDate,
  slotTime
) => {
  return api.post("/api/user/book-appointment", {
    lawyerId,
    slotDate,
    slotTime,
  });
};
