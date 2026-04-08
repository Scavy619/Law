import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Video, ArrowDownAZ, ArrowUpZA, Filter, Check, X } from "lucide-react";
import { LawyerContext } from "../../context/LawyerContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import Loader from "../../components/common/Loader";
import { useJoinStatus } from "../../hooks/canJoinVideo";
import Pagination from "../../components/common/Pagination";

const AppointmentActionButtons = ({
  item,
  handleJoinVideoCall,
  cancelAppointment,
  completeAppointment,
}) => {
  const { state, countdown } = useJoinStatus(item);

  const formatCountdown = (seconds) => {
    if (seconds > 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isAppointmentCancelled =
    item.cancelled && item.cancelled !== "Not Cancelled";

  const isPaid = item.payment;
  const isCompleted = item.isCompleted;

  const canShowVideo = isPaid && !isAppointmentCancelled && !isCompleted;

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {/* Video Call Buttons */}
      {canShowVideo && (
        <>
          {state === "join" && (
            <button
              onClick={() => handleJoinVideoCall(item.id)}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-full text-[10px] font-bold transition-all duration-300 shadow-md hover:shadow-green-200 ring-2 ring-white"
              title="Join Video Call"
            >
              <Video size={14} className="stroke-[2.5px]" />
              JOIN CALL
            </button>
          )}

          {state === "too_early" && (
            <button
              disabled
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-500 rounded-full text-[10px] font-bold transition-all duration-300 cursor-not-allowed border border-gray-300"
            >
              WAIT {formatCountdown(countdown)}
            </button>
          )}

          {state === "expired" && (
            <button
              disabled
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-500 rounded-full text-[10px] font-bold transition-all duration-300 cursor-not-allowed border border-gray-300"
            >
              EXPIRED
            </button>
          )}
        </>
      )}

      <button
        onClick={() => cancelAppointment(item.id)}
        className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-full transition-all duration-300 group border border-red-100"
        title="Cancel Appointment"
      >
        <X size={16} />
      </button>

      <button
        onClick={() => completeAppointment(item.id)}
        className="p-2 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white rounded-full transition-all duration-300 group border border-green-100"
        title="Complete Appointment"
      >
        <Check size={16} />
      </button>
    </div>
  );
};

const LawyerAppointments = () => {
  const {
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
  } = useContext(LawyerContext);
  const { slotDateFormat, calculateAge, currency, lawyerData } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Filters State
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    const response = await getAppointments(page, 10, statusFilter, sortOrder);
    if (response?.data?.pagination) {
      setTotalPages(response.data.pagination.totalPages);
      setCurrentPage(page);
    }
    setLoading(false);
  };

  // Handle video call
  const handleJoinVideoCall = (appointmentId) => {
    navigate(`/lawyer/video-call/${appointmentId}`);
  };

  useEffect(() => {
    if (lawyerData) {
      fetchAppointments(1);
    } else {
      setLoading(false);
    }
  }, [lawyerData, statusFilter, sortOrder]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 gap-4 sticky top-0 bg-white z-10 shadow-sm">
        <p className="text-2xl font-bold text-gray-800">All Appointments</p>

        {/* Controls Section */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="relative flex-1 min-w-[140px] sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Sort Button */}
          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm active:scale-95"
            title={`Sort Date: ${sortOrder === "desc" ? "Newest First" : "Oldest First"}`}
          >
            <span className="hidden sm:inline">Date</span>
            {sortOrder === "desc" ? (
              <ArrowDownAZ size={16} />
            ) : (
              <ArrowUpZA size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1fr_1.5fr] items-center py-4 px-6 border-b border-gray-100 bg-gray-50/80 font-semibold text-gray-500 tracking-wider uppercase text-xs sticky top-0 z-10">
          <p>#</p>
          <p>Client</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p className="text-right">Action</p>
        </div>

        <div className="divide-y divide-gray-50">
          {appointments.map((item, index) => (
            <div
              className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1fr_1.5fr] items-start sm:items-center py-4 px-6 gap-3 sm:gap-4 hover:bg-gray-50/60 transition-colors"
              key={index}
            >
              <p className="hidden sm:block text-gray-400 font-medium">
                {index + 1}
              </p>

              <div className="w-full sm:w-auto flex justify-between sm:block">
                <span className="sm:hidden text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Client
                </span>
                <p className="font-medium text-gray-800">
                  {item.user?.name || "Unknown"}
                </p>
              </div>

              <div className="w-full sm:w-auto flex justify-between sm:block">
                <span className="sm:hidden text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Time
                </span>
                <p className="text-gray-600">
                  {slotDateFormat(item.slotDate)},{" "}
                  <span className="text-gray-400">{item.slotTime}</span>
                </p>
              </div>

              <div className="w-full sm:w-auto flex justify-between sm:block">
                <span className="sm:hidden text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Fees
                </span>
                <p className="font-medium text-gray-700">
                  {currency}
                  {item.amount}
                </p>
              </div>

              <div className="w-full sm:w-auto flex justify-end sm:flex sm:justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 items-center gap-2 pr-2">
                {item.cancelled && item.cancelled !== "Not Cancelled" ? (
                  <span className="px-3 md:px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold whitespace-nowrap border border-red-100">
                    CANCELLED
                  </span>
                ) : item.isCompleted ? (
                  <span className="px-3 md:px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold whitespace-nowrap border border-green-100">
                    COMPLETED
                  </span>
                ) : (
                  <AppointmentActionButtons
                    item={item}
                    handleJoinVideoCall={handleJoinVideoCall}
                    cancelAppointment={cancelAppointment}
                    completeAppointment={completeAppointment}
                  />
                )}
              </div>
            </div>
          ))}

          {(!appointments || appointments.length === 0) && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Filter size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">
                No appointments found
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your filters or search terms.
              </p>
              {statusFilter !== "all" && (
                <button
                  onClick={() => setStatusFilter("all")}
                  className="mt-4 text-primary hover:text-primary/80 font-semibold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchAppointments}
        />
      </div>
    </div>
  );
};

export default LawyerAppointments;
