import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { X } from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { adminData, lawyerData } = useContext(AppContext);

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 shadow-2xl md:shadow-none min-h-screen w-full md:w-auto md:relative transition-transform duration-300 ease-in-out flex flex-col
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}>
      {/* Mobile Close Button Header */}
      <div className="flex md:hidden items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="font-semibold text-gray-800">Menu</span>
        <button
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
          className="p-1.5 text-gray-500 hover:text-primary transition-colors hover:bg-gray-50 rounded-lg active:scale-95 flex items-center justify-center"
          aria-label="Close Sidebar"
        >
          <X size={24} />
        </button>
      </div>
      {adminData && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            to={"/admin-dashboard"}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary text-primary" : "hover:bg-gray-50"}`
            }
          >
            <img className="min-w-5 shrink-0" src={assets.home_icon} alt="" />
            <p className="font-medium whitespace-nowrap">Dashboard</p>
          </NavLink>
          <NavLink
            to={"/all-appointments"}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary text-primary" : "hover:bg-gray-50"}`
            }
          >
            <img className="min-w-5 shrink-0" src={assets.appointment_icon} alt="" />
            <p className="font-medium whitespace-nowrap">Appointments</p>
          </NavLink>
          <NavLink
            to={"/add-lawyer"}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary text-primary" : "hover:bg-gray-50"}`
            }
          >
            <img className="min-w-5 shrink-0" src={assets.add_icon} alt="" />
            <p className="font-medium whitespace-nowrap">Add lawyer</p>
          </NavLink>
          <NavLink
            to={"/lawyer-list"}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary text-primary" : "hover:bg-gray-50"}`
            }
          >
            <img className="min-w-5 shrink-0" src={assets.people_icon} alt="" />
            <p className="font-medium whitespace-nowrap">Lawyers List</p>
          </NavLink>
        </ul>
      )}

      {lawyerData && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            to={"/lawyer-dashboard"}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary text-primary" : "hover:bg-gray-50"}`
            }
          >
            <img className="min-w-5 shrink-0" src={assets.home_icon} alt="" />
            <p className="font-medium whitespace-nowrap">Dashboard</p>
          </NavLink>
          <NavLink
            to={"/lawyer-appointments"}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary text-primary" : "hover:bg-gray-50"}`
            }
          >
            <img className="min-w-5 shrink-0" src={assets.appointment_icon} alt="" />
            <p className="font-medium whitespace-nowrap">Appointments</p>
          </NavLink>
          <NavLink
            to={"/lawyer-profile"}
            onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-6 md:px-9 md:min-w-72 cursor-pointer transition-colors ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary text-primary" : "hover:bg-gray-50"}`
            }
          >
            <img className="min-w-5 shrink-0" src={assets.people_icon} alt="" />
            <p className="font-medium whitespace-nowrap">Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
