import api from "./axiosClient";

// CREATE Razorpay order / initiate payment
export const createRazorpayPayment = async (appointmentId) => {
  return api.post("/api/user/payment-razorpay", {
    appointmentId,
  });
};

// VERIFY Razorpay payment
export const verifyRazorpayPayment = async (response) => {
  return api.post("/api/user/verify-razorpay", response);
};
