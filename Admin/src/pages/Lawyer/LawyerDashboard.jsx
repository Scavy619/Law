import React, { useContext, useEffect, useState } from "react";
import { LawyerContext } from "../../context/LawyerContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import Loader from "../../components/common/Loader";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight, X, Check, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS_PIE = ["#22c55e", "#ef4444", "#f59e0b"];
const COLORS_BAR = "#6366f1";

const LawyerDashboard = () => {
  const { dashData, getDashData, cancelAppointment, completeAppointment } =
    useContext(LawyerContext);
  const { slotDateFormat, currency, lawyerData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Date formatting for the welcome header
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (lawyerData) {
      getDashData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [lawyerData]);

  if (loading) {
    return <Loader />;
  }

  if (!dashData) {
    return (
      <div className="flex justify-center items-center m-5 h-64">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Unable to load dashboard data</p>
          <button
            onClick={() => {
              setLoading(true);
              getDashData().finally(() => setLoading(false));
            }}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "Completed", value: dashData.statusBreakdown?.completed || 0 },
    { name: "Cancelled", value: dashData.statusBreakdown?.cancelled || 0 },
    { name: "Pending", value: dashData.statusBreakdown?.pending || 0 },
  ];

  return (
    <div className="m-5 md:m-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Track your performance and manage your upcoming consultations.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600 w-fit">
          <CalendarDays size={18} className="text-gray-400" />
          {today}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Earnings Card */}
        <div className="flex items-center gap-4 bg-amber-50/40 p-6 md:p-8 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden group">
          <div className="bg-amber-500/10 p-4 md:p-5 rounded-xl group-hover:scale-110 transition-transform">
            <img
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              src={assets.earning_icon}
              alt="Earnings"
            />
          </div>
          <div className="z-10">
            <p className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-1">
              {currency} {dashData.earnings}
            </p>
            <p className="text-sm md:text-base font-semibold text-amber-600/80 uppercase tracking-widest">
              Total Earnings
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 text-amber-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <img className="w-32 h-32" src={assets.earning_icon} alt="" />
          </div>
        </div>

        {/* Appointments Card */}
        <div className="flex items-center gap-4 bg-indigo-50/40 p-6 md:p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden group">
          <div className="bg-indigo-500/10 p-4 md:p-5 rounded-xl group-hover:scale-110 transition-transform">
            <img
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              src={assets.appointments_icon}
              alt="Appointments"
            />
          </div>
          <div className="z-10">
            <p className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-1">
              {dashData.appointments}
            </p>
            <p className="text-sm md:text-base font-semibold text-indigo-600/80 uppercase tracking-widest">
              Appointments
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 text-indigo-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <img className="w-32 h-32" src={assets.appointments_icon} alt="" />
          </div>
        </div>

        {/* Clients Card */}
        <div className="flex items-center gap-4 bg-emerald-50/40 p-6 md:p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden group">
          <div className="bg-emerald-500/10 p-4 md:p-5 rounded-xl group-hover:scale-110 transition-transform">
            <img
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              src={assets.patients_icon}
              alt="Patients"
            />
          </div>
          <div className="z-10">
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-900 mb-1">
              {dashData.patients}
            </p>
            <p className="text-sm md:text-base font-semibold text-emerald-600/80 uppercase tracking-widest">
              Total Clients
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 text-emerald-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <img className="w-32 h-32" src={assets.patients_icon} alt="" />
          </div>
        </div>
        {/* Completion Rate Card */}
        <div className="flex items-center gap-4 bg-amber-50/40 p-6 md:p-8 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden group">
          <div className="bg-amber-500/10 p-4 md:p-5 rounded-xl group-hover:scale-110 transition-transform">
            <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-amber-600" />
          </div>
          <div className="z-10">
            <p className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-1">
              {dashData.completionRate}%
            </p>
            <p className="text-sm md:text-base font-semibold text-amber-600/80 uppercase tracking-widest">
              Completion Rate
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 text-amber-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <TrendingUp className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* Earnings Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Weekly Earnings Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Earnings - Last 7 Days
          </h2>
          {!dashData.earningsTrend || dashData.earningsTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={dashData.earningsTrend}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Amount"]}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="amount"
                  fill={COLORS_BAR}
                  radius={[4, 4, 0, 0]}
                  name="Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Earnings Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Earnings - Last 12 Months
          </h2>
          {!dashData.monthlyEarningsTrend ||
          dashData.monthlyEarningsTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={dashData.monthlyEarningsTrend}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Amount"]}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="amount"
                  fill={COLORS_BAR}
                  radius={[4, 4, 0, 0]}
                  name="Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Pie Chart - Appointment Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Appointment Status
          </h2>
          {dashData.appointments === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS_PIE[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Latest Bookings Section */}
      <div className="bg-white mt-8 md:mt-10 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border border-gray-100 rounded-lg shadow-sm">
              <img
                className="w-5 h-5 opacity-70"
                src={assets.list_icon}
                alt=""
              />
            </div>
            <p className="font-bold text-lg md:text-xl text-gray-800">
              Latest Bookings
            </p>
          </div>
          <button
            onClick={() => navigate("/lawyer-appointments")}
            className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
          >
            View All
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              key={index}
            >
              <div className="flex items-center gap-4">
                <img
                  className="rounded-full w-12 h-12 object-cover border-2 border-white shadow-sm"
                  src={item.user?.image || "/default-user.png"}
                  alt={item.user?.name || "User"}
                />
                <div className="flex flex-col">
                  <p className="text-gray-900 font-semibold text-base tracking-tight">
                    {item.user?.name || "Unknown"}
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => cancelAppointment(item.id)}
                      className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-full transition-all duration-300 group text-xs font-bold tracking-wide"
                      title="Cancel Appointment"
                    >
                      <X
                        size={14}
                        className="opacity-80 group-hover:opacity-100"
                      />
                      <span className="hidden sm:inline">CANCEL</span>
                    </button>
                    <button
                      onClick={() => completeAppointment(item.id)}
                      className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white border border-green-100 hover:border-green-500 rounded-full transition-all duration-300 group text-xs font-bold tracking-wide"
                      title="Complete Appointment"
                    >
                      <Check
                        size={14}
                        className="opacity-80 group-hover:opacity-100"
                      />
                      <span className="hidden sm:inline">COMPLETE</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {(!dashData.latestAppointments ||
            dashData.latestAppointments.length === 0) && (
            <div className="px-6 py-8 text-center text-gray-500">
              No recent bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
