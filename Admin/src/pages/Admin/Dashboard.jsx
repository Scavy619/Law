import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import Loader from "../../components/common/Loader";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ArrowRight,
  X,
  TrendingUp,
  Users,
  Briefcase,
  IndianRupee,
} from "lucide-react";
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

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div
    className={`flex items-center gap-4 p-6 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group ${color.bg} ${color.border}`}
  >
    <div
      className={`p-4 rounded-xl group-hover:scale-110 transition-transform ${color.iconBg}`}
    >
      <Icon size={24} className={color.icon} />
    </div>
    <div className="z-10">
      <p className={`text-3xl font-extrabold mb-1 ${color.value}`}>{value}</p>
      <p
        className={`text-sm font-semibold uppercase tracking-widest ${color.label}`}
      >
        {label}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const { getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat, adminData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (adminData) {
      getDashData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [adminData]);

  if (loading) return <Loader />;

  if (!dashData) return null;

  const statusData = [
    { name: "Completed", value: dashData.statusBreakdown?.completed || 0 },
    { name: "Cancelled", value: dashData.statusBreakdown?.cancelled || 0 },
    { name: "Pending", value: dashData.statusBreakdown?.pending || 0 },
  ];

  const specialityData = dashData.specialityBreakdown || [];

  return (
    <div className="m-5 md:m-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Here's what's happening with the platform today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600 w-fit">
          <CalendarDays size={18} className="text-gray-400" />
          {today}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Briefcase}
          label="Lawyers"
          value={dashData.lawyers}
          color={{
            bg: "bg-blue-50/40",
            border: "border-blue-100",
            iconBg: "bg-blue-500/10",
            icon: "text-blue-600",
            value: "text-blue-900",
            label: "text-blue-600/80",
          }}
        />
        <StatCard
          icon={CalendarDays}
          label="Appointments"
          value={dashData.appointments}
          color={{
            bg: "bg-indigo-50/40",
            border: "border-indigo-100",
            iconBg: "bg-indigo-500/10",
            icon: "text-indigo-600",
            value: "text-indigo-900",
            label: "text-indigo-600/80",
          }}
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={dashData.patients}
          color={{
            bg: "bg-emerald-50/40",
            border: "border-emerald-100",
            iconBg: "bg-emerald-500/10",
            icon: "text-emerald-600",
            value: "text-emerald-900",
            label: "text-emerald-600/80",
          }}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${dashData.totalRevenue || 0}`}
          color={{
            bg: "bg-amber-50/40",
            border: "border-amber-100",
            iconBg: "bg-amber-500/10",
            icon: "text-amber-600",
            value: "text-amber-900",
            label: "text-amber-600/80",
          }}
        />
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
        {/* Pie Chart - Status Breakdown */}
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

        {/* Bar Chart - Speciality Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Appointments by Speciality
          </h2>
          {specialityData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={specialityData}
                margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={COLORS_BAR}
                  radius={[4, 4, 0, 0]}
                  name="Appointments"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Latest Bookings */}
      <div className="bg-white mt-8 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
            onClick={() => navigate("/all-appointments")}
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
          {dashData.latestAppointments?.slice(0, 5).map((item, index) => (
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
                <div>
                  <p className="text-gray-900 font-semibold text-base">
                    {item.lawyer?.name || "Unknown Lawyer"}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 inline-block mr-1"></span>
                    {slotDateFormat(item.slotDate)}
                  </p>
                </div>
              </div>
              <div>
                {item.cancelled && item.cancelled !== "Not Cancelled" ? (
                  <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
                    CANCELLED
                  </span>
                ) : item.isCompleted ? (
                  <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                    COMPLETED
                  </span>
                ) : (
                  <button
                    onClick={() => cancelAppointment(item.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-red-500 rounded-full transition-all duration-300 group text-xs font-bold"
                  >
                    <X size={14} />
                    <span className="hidden sm:inline">CANCEL</span>
                  </button>
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

export default Dashboard;
