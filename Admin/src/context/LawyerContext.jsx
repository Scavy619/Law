import { createContext, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosClient";

export const LawyerContext = createContext();

const LawyerContextProvider = (props) => {
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  // Getting Lawyer appointment data from Database using API
  const getAppointments = useCallback(async () => {
    try {
      const { data } = await api.get("/api/lawyer/appointments");

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  }, []);

  // Getting Lawyer profile data from Database using API
  const getProfileData = useCallback(async () => {
    try {
      const { data } = await api.get("/api/lawyer/profile");

      if (data.success) {
        setProfileData(data.profileData);
      } else {
        toast.error(data.message);
        // console.error("Profile fetch failed:", data.message);
      }
    } catch (error) {
      // console.log("Profile fetch error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, []);

  // Getting lawyer dashboard data using API
  const getDashData = useCallback(async () => {
    try {
      const { data } = await api.get("/api/lawyer/dashboard");

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
        // console.error("Dashboard fetch failed:", data.message);
      }
    } catch (error) {
      // console.log("Dashboard fetch error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, []);

  // Function to cancel lawyer appointment using API
  const cancelAppointment = useCallback(
    async (appointmentId) => {
      try {
        const { data } = await api.post("/api/lawyer/cancel-appointment", {
          appointmentId,
        });

        if (data.success) {
          toast.success(data.message);
          getAppointments();
          getDashData();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
        // console.log(error);
      }
    },
    [getAppointments, getDashData],
  );

  // Function to mark appointment completed using API
  const completeAppointment = useCallback(
    async (appointmentId) => {
      try {
        const { data } = await api.post("/api/lawyer/complete-appointment", {
          appointmentId,
        });

        if (data.success) {
          toast.success(data.message);
          getAppointments();
          getDashData();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
        // console.log(error);
      }
    },
    [getAppointments, getDashData],
  );

  const value = useMemo(
    () => ({
      appointments,
      getAppointments,
      cancelAppointment,
      completeAppointment,
      dashData,
      getDashData,
      profileData,
      setProfileData,
      getProfileData,
    }),
    [
      appointments,
      getAppointments,
      cancelAppointment,
      completeAppointment,
      dashData,
      getDashData,
      profileData,
      getProfileData,
    ],
  );

  return (
    <LawyerContext.Provider value={value}>
      {props.children}
    </LawyerContext.Provider>
  );
};

export default LawyerContextProvider;
