import api from "./axiosClient";

// CREATE chat
export const createChat = async (sessionId) => {
  return api.post("/api/chat/create", {
    sessionId,
  });
};

// GET chat by session
export const getChatBySession = async (sessionId) => {
  return api.get(`/api/chat/get/${sessionId}`);
};
