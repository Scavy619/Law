import { createContext, useEffect, useState } from "react";
import api from "../api/axiosClient";
import { setAdminAccessToken, setLawyerAccessToken } from "./auth.tokens";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  // Auth state
  const [adminData, setAdminData] = useState(null);
  const [lawyerData, setLawyerData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
  const slotDateFormat = (slotDate) => {
    if (!slotDate) return "-";
    const dateArray = slotDate.split("_");
    if (dateArray.length !== 3) return "-";
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  // Function to calculate the age eg. ( 20_01_2000 => 24 )
  const calculateAge = (dob) => {
    if (!dob) return "-";
    const today = new Date();
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "-";
    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  // 🔐 INIT AUTH (refresh token flow)
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);

      // Try to refresh admin token first
      try {
        const { data } = await api.post("/api/admin/refresh");
        setAdminAccessToken(data.accessToken);
        setAdminData(data.admin);
        setAuthLoading(false);
        return; // Admin authenticated, no need to check lawyer
      } catch (error) {
        // If not admin, clear admin auth
        if (error.response?.status !== 401) {
          // console.error("Admin auth initialization error:", error);
        }
        setAdminData(null);
      }

      // If admin refresh failed, try lawyer refresh
      try {
        const { data } = await api.post("/api/lawyer/refresh");
        setLawyerAccessToken(data.accessToken);
        setLawyerData(data.lawyer);
      } catch (error) {
        // If not lawyer either, that's fine
        if (error.response?.status !== 401) {
          // console.error("Lawyer auth initialization error:", error);
        }
        setLawyerData(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    currency,
    slotDateFormat,
    calculateAge,

    // Auth state
    adminData,
    setAdminData,
    lawyerData,
    setLawyerData,
    authLoading,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
