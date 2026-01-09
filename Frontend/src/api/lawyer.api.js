import api from "./axiosClient";

export const getLawyersData = async () => {
  return api.get("/api/lawyer/list");
};
