import api from "./axiosClient";

// get video token
export const getVideoToken = async (appointmentId) => {
  return api.post("/api/video/get-token", { appointmentId });
};

// join video call
export const joinVideoCall = async (appointmentId) => {
  return api.post("/api/video/update-status", {
    appointmentId,
    action: "join",
  });
};

// leave video call
export const leaveVideoCall = async (appointmentId) => {
  return api.post("/api/video/update-status", {
    appointmentId,
    action: "leave",
  });
};
