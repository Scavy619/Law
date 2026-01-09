import api from "./axiosClient";

// get user profile
export const getUserProfileData = async () => {
  return api.get("/api/user/get-profile");
};

// delete account (request OTP)
export const requestDeleteAccount = async () => {
  return api.post("/api/user/delete-account/request");
};

// delete account (verify OTP)
export const verifyDeleteAccount = async (otp) => {
  return api.post("/api/user/delete-account/verify", { otp });
};

// signup
export const signupUser = async (name, email, password) => {
  return api.post("/api/user/signup", { name, email, password });
};

// login
export const loginUser = async (email, password) => {
  return api.post("/api/user/login", { email, password });
};

// resend verification email
export const resendVerification = async (email) => {
  return api.post("/api/user/resend-verification", { email });
};

// forgot password
export const forgotPassword = async (email) => {
  return api.post("/api/user/forgot-password", { email });
};

// update profile
export const updateUserProfile = async (formData) => {
  return api.patch("/api/user/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// reset password
export const resetPassword = async (resetToken, password) => {
  return api.post(`/api/user/reset-password/${resetToken}`, { password });
};

// verify email
export const verifyUserEmail = async (verificationToken) => {
  return api.get(`/api/user/verify-email/${verificationToken}`);
};
