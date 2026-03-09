import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight, X } from "lucide-react";

const Dashboard = () => {
  const { getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat, adminData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Date formatting for the welcome header
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    if (adminData) {
      getDashData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [adminData]);

  if (loading) {
    return <Loading />;
  }

  return (
    dashData && (
      <div className="m-5 md:m-8 max-w-7xl mx-auto">

        {/* Welcome Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Here's what's happening with the platform today.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600 w-fit">
            <CalendarDays size={18} className="text-gray-400" />
            {today}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lawyers Card */}
          <div className="flex items-center gap-4 bg-blue-50/40 p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden group">
            <div className="bg-blue-500/10 p-4 md:p-5 rounded-xl group-hover:scale-110 transition-transform">
              <img className="w-10 h-10 md:w-12 md:h-12 object-contain" src={assets.doctor_icon} alt="Lawyers" />
            </div>
            <div className="z-10">
              <p className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">
                {dashData.lawyers}
              </p>
              <p className="text-sm md:text-base font-semibold text-blue-600/80 uppercase tracking-widest">Lawyers</p>
            </div>
            <div className="absolute -bottom-6 -right-6 text-blue-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <img className="w-32 h-32" src={assets.doctor_icon} alt="" />
            </div>
          </div>

          {/* Appointments Card */}
          <div className="flex items-center gap-4 bg-indigo-50/40 p-6 md:p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden group">
            <div className="bg-indigo-500/10 p-4 md:p-5 rounded-xl group-hover:scale-110 transition-transform">
              <img className="w-10 h-10 md:w-12 md:h-12 object-contain" src={assets.appointments_icon} alt="Appointments" />
            </div>
            <div className="z-10">
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-1">
                {dashData.appointments}
              </p>
              <p className="text-sm md:text-base font-semibold text-indigo-600/80 uppercase tracking-widest">Appointments</p>
            </div>
            <div className="absolute -bottom-6 -right-6 text-indigo-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <img className="w-32 h-32" src={assets.appointments_icon} alt="" />
            </div>
          </div>

          {/* Clients Card */}
          <div className="flex items-center gap-4 bg-emerald-50/40 p-6 md:p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden group">
            <div className="bg-emerald-500/10 p-4 md:p-5 rounded-xl group-hover:scale-110 transition-transform">
              <img className="w-10 h-10 md:w-12 md:h-12 object-contain" src={assets.patients_icon} alt="Clients" />
            </div>
            <div className="z-10">
              <p className="text-3xl md:text-4xl font-extrabold text-emerald-900 mb-1">
                {dashData.patients}
              </p>
              <p className="text-sm md:text-base font-semibold text-emerald-600/80 uppercase tracking-widest">Clients</p>
            </div>
            <div className="absolute -bottom-6 -right-6 text-emerald-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <img className="w-32 h-32" src={assets.patients_icon} alt="" />
            </div>
          </div>
        </div>

        {/* Latest Bookings Section */}
        <div className="bg-white mt-8 md:mt-10 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 border border-gray-100 rounded-lg shadow-sm">
                <img className="w-5 h-5 opacity-70" src={assets.list_icon} alt="" />
              </div>
              <p className="font-bold text-lg md:text-xl text-gray-800">Latest Bookings</p>
            </div>
            <button
              onClick={() => navigate('/all-appointments')}
              className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
            >
              View All
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {dashData.latestAppointments &&
              dashData.latestAppointments.slice(0, 5).map((item, index) => (
                <div
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  key={index}
                >
                  <div className="flex items-center gap-4">
                    <img
                      className="rounded-full w-12 h-12 object-cover border-2 border-white shadow-sm"
                      src={item.lawyer?.image || "/default-lawyer.png"}
                      alt={item.lawyer?.name || "Lawyer"}
                    />
                    <div className="flex flex-col">
                      <p className="text-gray-900 font-semibold text-base tracking-tight">
                        {item.lawyer?.name || "Unknown Lawyer"}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/70 inline-block mr-1"></span>
                        {slotDateFormat(item.slotDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    {item.cancelled && item.cancelled !== "Not Cancelled" ? (
                      <span className="px-3 md:px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold whitespace-nowrap border border-red-100">
                        CANCELLED
                      </span>
                    ) : item.isCompleted ? (
                      <span className="px-3 md:px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold whitespace-nowrap border border-green-100">
                        COMPLETED
                      </span>
                    ) : (
                      <button
                        onClick={() => cancelAppointment(item.id)}
                        className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-full transition-all duration-300 group text-xs font-bold tracking-wide"
                        title="Cancel Appointment"
                      >
                        <X size={14} className="opacity-80 group-hover:opacity-100" />
                        <span className="hidden sm:inline">CANCEL</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

            {(!dashData.latestAppointments || dashData.latestAppointments.length === 0) && (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent bookings found.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
