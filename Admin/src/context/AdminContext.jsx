import {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import { AppContext } from "./AppContext";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const { adminData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [dashData, setDashData] = useState(false);

  // Getting all Lawyers data from Database using API
  const getAllLawyers = useCallback(async () => {
    try {
      if (!adminData) {
        toast.error("Please login first");
        return;
      }

      const { data } = await api.get("/api/admin/all-lawyers");

      if (data.success) {
        setLawyers(data.lawyers);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // console.error("Error fetching lawyers:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [adminData]);

  // Function to change lawyer availablity using API
  const changeAvailability = useCallback(
    async (lawyerId) => {
      try {
        if (!adminData) {
          toast.error("Please login first");
          return;
        }

        const { data } = await api.post("/api/admin/change-availability", {
          lawyerId,
        });

        if (data.success) {
          toast.success(data.message);
          getAllLawyers(); // Refresh the lawyers list
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        // console.error("Error changing availability:", error);
        toast.error(error.response?.data?.message || error.message);
      }
    },
    [adminData, getAllLawyers],
  );

  // Getting all appointment data from Database using API
  const getAllAppointments = useCallback(async () => {
    try {
      const { data } = await api.get("/api/admin/all-appointments");
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      // console.log(error);
    }
  }, []);

  // Function to cancel appointment using API
  const cancelAppointment = useCallback(
    async (appointmentId) => {
      try {
        if (!adminData) {
          toast.error("Please login first");
          return;
        }

        const { data } = await api.post("/api/admin/cancel-appointment", {
          appointmentId,
        });

        if (data.success) {
          toast.success(data.message);
          await getAllAppointments(); // Refresh the appointments list
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        // console.error("Cancel appointment error:", error);
        toast.error(
          error.response?.data?.message || "Failed to cancel appointment",
        );
      }
    },
    [adminData, getAllAppointments],
  );

  // Getting Admin Dashboard data from Database using API
  const getDashData = useCallback(async () => {
    try {
      const { data } = await api.get("/api/admin/dashboard");

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      lawyers,
      getAllLawyers,
      changeAvailability,
      appointments,
      getAllAppointments,
      getDashData,
      cancelAppointment,
      dashData,
    }),
    [
      lawyers,
      getAllLawyers,
      changeAvailability,
      appointments,
      getAllAppointments,
      getDashData,
      cancelAppointment,
      dashData,
    ],
  );

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
