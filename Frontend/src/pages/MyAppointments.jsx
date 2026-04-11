import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useApp from "../context/useApp";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { Video } from "lucide-react";
import {
  getUserAppointments as userAppointments,
  cancelAppointment as cancelTheAppointment,
} from "../api/appointment.api";
import {
  createRazorpayPayment,
  verifyRazorpayPayment,
} from "../api/payment.api";
import { useJoinStatus } from "../hooks/canJoinVideo";
import Loader from "../components/common/Loader";

const AppointmentActionButtons = ({
  item,
  payment,
  setPayment,
  appointmentRazorpay,
  handleJoinVideoCall,
  cancelAppointment,
  isAppointmentCancelled,
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

  return (
    <div className="sm:w-48 shrink-0 flex flex-col gap-3 justify-center">
      {!isAppointmentCancelled(item) && !item.payment && !item.isCompleted && (
        <>
          {payment !== item.id ? (
            <button
              onClick={() => setPayment(item.id)}
              className="w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Pay Online
            </button>
          ) : (
            <button
              onClick={() => appointmentRazorpay(item.id)}
              className="w-full px-4 py-2 rounded-lg bg-white border-2 border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
            >
              <img
                className="max-h-6"
                src={assets.razorpay_logo}
                alt="Pay with Razorpay"
              />
            </button>
          )}
        </>
      )}

      {/* Join Video Call Button - Only show if PAID and NOT cancelled/completed */}
      {item.payment && !isAppointmentCancelled(item) && !item.isCompleted && (
        <>
          {state === "join" && (
            <button
              onClick={() => handleJoinVideoCall(item.id)}
              className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Video size={18} />
              Join Video Call
            </button>
          )}

          {state === "too_early" && (
            <button
              disabled
              className="w-full px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
            >
              Opens in {formatCountdown(countdown)}
            </button>
          )}

          {state === "expired" && (
            <button
              disabled
              className="w-full px-4 py-2 rounded-lg bg-gray-300 text-gray-600"
            >
              Meeting expired
            </button>
          )}
        </>
      )}

      {!isAppointmentCancelled(item) && !item.isCompleted && (
        <button
          onClick={() => cancelAppointment(item.id)}
          className="w-full px-4 py-2 rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancel
        </button>
      )}
    </div>
  );
};

const MyAppointments = () => {
  const { userData, authLoading } = useApp();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [payment, setPayment] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get("filter") || "all";
  const limit = parseInt(searchParams.get("limit")) || 7;
  const page = parseInt(searchParams.get("page")) || 1;

  const [totalPages, setTotalPages] = useState(1);

  const updateParams = (newParams) => {
    const currentParams = Object.fromEntries([...searchParams]);
    setSearchParams({ ...currentParams, ...newParams });
  };

  const setFilter = (val) => updateParams({ filter: val, page: 1 });
  const setLimit = (val) => updateParams({ limit: val, page: 1 });
  const setPage = (val) => updateParams({ page: typeof val === "function" ? val(page) : val });
  const [loading, setLoading] = useState(false);

  // Months array for date formatting
  const months = [
    " ",
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
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  // Helper function to check if appointment is actually cancelled
  const isAppointmentCancelled = (appointment) => {
    return appointment.cancelled && appointment.cancelled !== "Not Cancelled";
  };

  // Getting User Appointments Data Using API
  const getUserAppointments = async () => {
    try {
      setLoading(true);
      if (!userData) {
        toast.error("Please login to view appointments");
        navigate("/login");
        return;
      }

      const { data } = await userAppointments(
        page,
        limit,
        filter === "all" ? "" : filter,
      );

      if (data.success) {
        setAppointments(data.appointments);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      // console.log("Appointment fetch error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load appointments",
      );
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await cancelTheAppointment(appointmentId);

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to cancel appointment",
      );
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await verifyRazorpayPayment(response);
          if (data.success) {
            navigate("/my-appointments");
            getUserAppointments();
          }
        } catch (error) {
          // console.log(error);
          toast.error(
            error.response?.data?.message || "Payment verification failed",
          );
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    if (userData) {
      getUserAppointments();
    }
  }, [page, limit, filter, userData]);


  // Function to make payment using razorpay
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await createRazorpayPayment(appointmentId);

      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  // video calling
  const handleJoinVideoCall = (appointmentId) => {
    navigate(`/video-call/${appointmentId}`);
  };

  if (authLoading) {
    return <Loader minHeight="min-h-screen" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          My Appointments
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
          {["all", "upcoming", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Limit Dropdown */}
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="5">5 per page</option>
            <option value="7">7 per page</option>
            <option value="15">15 per page</option>
            <option value="30">30 per page</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No appointments found
            </h3>
            <p className="mt-1 text-gray-500">
              You haven't booked any appointments yet.
            </p>
          </div>
        ) : (
          appointments.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-6 p-6">
                {/* Lawyer Image */}
                <div className="sm:w-48 flex-shrink-0">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#EAEFFF]">
                    <img
                      className="w-full h-full object-cover"
                      src={item.lawyer.image || assets.legallogo}
                      alt={item.lawyer.name}
                    />
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-2">
                      {isAppointmentCancelled(item) && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {item.cancelled}
                        </span>
                      )}
                      {item.isCompleted && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Completed
                        </span>
                      )}
                      {!isAppointmentCancelled(item) &&
                        item.payment &&
                        !item.isCompleted && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Paid
                          </span>
                        )}
                    </div>

                    {/* lawyer Info */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {item.lawyer.name}
                      </h3>
                      <p className="text-primary font-medium">
                        {item.lawyer.speciality}
                      </p>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Date & Time
                        </h4>
                        <p className="text-gray-900 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {slotDateFormat(item.slotDate)} | {item.slotTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons component */}
                <AppointmentActionButtons
                  item={item}
                  payment={payment}
                  setPayment={setPayment}
                  appointmentRazorpay={appointmentRazorpay}
                  handleJoinVideoCall={handleJoinVideoCall}
                  cancelAppointment={cancelAppointment}
                  isAppointmentCancelled={isAppointmentCancelled}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 mb-4 pb-8 w-full">
          <button
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors bg-white text-gray-700 font-medium shadow-sm"
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors bg-white text-gray-700 font-medium shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
