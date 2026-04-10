import api from "./axiosClient";

export const uploadDocument = async (formData) => {
  return api.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getUserDocuments = async () => {
  return api.get("/api/documents/");
};