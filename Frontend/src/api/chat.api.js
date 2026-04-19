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


/*
Blob = Binary Large Object
Basically, jab server se file-type data (PDF, image, JSON file, CSV, etc.) aata hai, toh browser usse binary form me receive karta hai, usko hi Blob bolte hain.
*/
// get all user chats
export const exportAllChats = async (format) => {
  return api.get(`/api/chat/export?format=${format}`, { responseType: "blob" });
};

// Export single chat
export const exportSingleChat = async (sessionId, format) => {
  return api.get(`/api/chat/export/${sessionId}?format=${format}`, { responseType: "blob" });
};

// Share chat — enable karo
export const shareChat = async (sessionId) => {
  return api.post(`/api/chat/${sessionId}/share`);
};

// Unshare chat — disable karo
export const unshareChat = async (sessionId) => {
  return api.delete(`/api/chat/${sessionId}/share`);
};

// Get shared chat — public, no auth
export const getSharedChat = async (shareToken) => {
  return api.get(`/api/chat/shared/${shareToken}`);
};
