import React, { useEffect, useState, useMemo } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import Loader from "../../components/common/Loader";
import { ArrowDownAZ, ArrowUpZA, Filter } from "lucide-react";

const AllAppointments = () => {
  const { appointments, cancelAppointment, getAllAppointments } =
    useContext(AdminContext);
  const { slotDateFormat, currency, adminData } =
    useContext(AppContext);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc' (default newest first)
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'upcoming', 'completed', 'cancelled'
  const [lawyerFilter, setLawyerFilter] = useState("all"); // 'all' or lawyer.name

  // Load appointments
  useEffect(() => {
    if (adminData) {
      getAllAppointments().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [adminData]);

  // Derived unique lawyers for the filter dropdown
  const uniqueLawyers = useMemo(() => {
    if (!appointments) return [];
    const lawyers = new Set(appointments.map(app => app.lawyer?.name).filter(Boolean));
    return Array.from(lawyers).sort();
  }, [appointments]);

  // Apply Filters and Sorting
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    let result = [...appointments];

    // 1. Status Filter
    if (statusFilter !== "all") {
      result = result.filter(item => {
        if (statusFilter === "cancelled") return item.cancelled && item.cancelled !== "Not Cancelled";
        if (statusFilter === "completed") return item.isCompleted;
        // Upcoming: neither cancelled nor completed
        if (statusFilter === "upcoming") return !item.cancelled && !item.isCompleted;
        return true;
      });
    }

    // 2. Lawyer Filter
    if (lawyerFilter !== "all") {
      result = result.filter(item => item.lawyer?.name === lawyerFilter);
    }

    // 3. Date Sort
    result.sort((a, b) => {
      // Safely parse slotDate from DD_MM_YYYY format to Date object for accurate comparison
      const parseDate = (dateStr) => {
        if (!dateStr) return 0;
        const [day, month, year] = dateStr.split('_').map(Number);
        return new Date(year, month - 1, day).getTime();
      };
      
      const dateA = parseDate(a.slotDate);
      const dateB = parseDate(b.slotDate);
      
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [appointments, statusFilter, lawyerFilter, sortOrder]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 gap-4 sticky top-0 bg-white z-10 shadow-sm">
        <p className="text-2xl font-bold text-gray-800">All Appointments</p>
        
        {/* Controls Section */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Lawyer Filter */}
          <div className="relative flex-1 min-w-[140px] sm:flex-none">
            <select
              value={lawyerFilter}
              onChange={(e) => setLawyerFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Lawyers</option>
              {uniqueLawyers.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
               <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

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
               <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm active:scale-95"
            title={`Sort Date: ${sortOrder === "desc" ? "Newest First" : "Oldest First"}`}
          >
            <span className="hidden sm:inline">Date</span>
            {sortOrder === "desc" ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_1fr_1fr] items-center py-4 px-6 border-b border-gray-100 bg-gray-50/80 font-semibold text-gray-500 tracking-wider uppercase text-xs sticky top-0 z-10">
          <p>#</p>
          <p>Client</p>
          <p>Date & Time</p>
          <p>Lawyer</p>
          <p>Fees</p>
          <p className="text-right">Action</p>
        </div>
        
        <div className="divide-y divide-gray-50">
          {filteredAppointments.map((item, index) => (
            <div
              className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_1fr_1fr] items-start sm:items-center py-4 px-6 gap-3 sm:gap-4 hover:bg-gray-50/60 transition-colors"
              key={index}
            >
              <p className="hidden sm:block text-gray-400 font-medium">{index + 1}</p>
              
              <div className="w-full sm:w-auto flex justify-between sm:block">
                <span className="sm:hidden text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</span>
                <p className="font-medium text-gray-800">{item.user?.name || "Unknown"}</p>
              </div>
              
              <div className="w-full sm:w-auto flex justify-between sm:block">
                 <span className="sm:hidden text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</span>
                 <p className="text-gray-600">
                  {slotDateFormat(item.slotDate)}, <span className="text-gray-400">{item.slotTime}</span>
                </p>
              </div>
              
              <div className="w-full sm:w-auto flex justify-between sm:block">
                <span className="sm:hidden text-xs font-semibold text-gray-400 uppercase tracking-wider">Lawyer</span>
                <p className="font-medium text-gray-800">{item.lawyer?.name || "Unknown Lawyer"}</p>
              </div>
              
              <div className="w-full sm:w-auto flex justify-between sm:block">
                <span className="sm:hidden text-xs font-semibold text-gray-400 uppercase tracking-wider">Fees</span>
                 <p className="font-medium text-gray-700">
                  {currency}{item.amount}
                </p>
              </div>
              
              <div className="w-full sm:w-auto flex justify-end sm:flex sm:justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 pr-2">
                {item.cancelled && item.cancelled !== "Not Cancelled" ? (
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold whitespace-nowrap">
                    Cancelled
                  </span>
                ) : item.isCompleted ? (
                   <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold whitespace-nowrap">
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={() => cancelAppointment(item.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                    title="Cancel Appointment"
                  >
                    <img
                      className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity"
                      src={assets.cancel_icon}
                      alt="Cancel"
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {(!filteredAppointments || filteredAppointments.length === 0) && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Filter size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">No appointments found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
              {appointments.length > 0 && (
                <button 
                  onClick={() => {
                     setStatusFilter('all');
                     setLawyerFilter('all');
                  }}
                  className="mt-4 text-primary hover:text-primary/80 font-semibold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllAppointments;
