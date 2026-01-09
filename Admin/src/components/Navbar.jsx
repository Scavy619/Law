import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { clearAdminAuth, clearLawyerAuth } from "../context/auth.tokens";
import { toast } from "react-toastify";

const Navbar = () => {
  const { adminData, setAdminData, lawyerData, setLawyerData } =
    useContext(AppContext);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      if (adminData) {
        // Admin logout
        await api.post("/api/admin/logout");
        clearAdminAuth();
        setAdminData(null);
        toast.success("Admin logged out successfully");
      } else if (lawyerData) {
        // Lawyer logout
        await api.post("/api/lawyer/logout");
        clearLawyerAuth();
        setLawyerData(null);
        toast.success("Lawyer logged out successfully");
      }

      navigate("/login");
    } catch (error) {
      // console.error("Logout error:", error);
      toast.error("Logout failed");

      // Even if logout fails, clear local state and redirect
      clearAdminAuth();
      clearLawyerAuth();
      setAdminData(null);
      setLawyerData(null);
      navigate("/login");
    }
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img
          onClick={() => navigate("/")}
          className="w-36 sm:w-40 cursor-pointer"
          src={assets.legallogo}
          alt=""
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {adminData ? "Admin" : "Lawyer"}
        </p>
      </div>
      <button
        onClick={() => logout()}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
