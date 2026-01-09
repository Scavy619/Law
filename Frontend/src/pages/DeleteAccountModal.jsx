import React, { useState } from "react";
import useApp from "../context/useApp";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { requestDeleteAccount, verifyDeleteAccount } from "../api/user.api";
import api from "../api/axiosClient";

const DeleteAccountModal = ({ onClose }) => {
  const { setUserData } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState("warning"); // warning | otp
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= SEND OTP =================
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const { data } = await requestDeleteAccount();

      if (data.success) {
        toast.success("OTP sent to your email");
        setStep("otp");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP & DELETE =================
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const { data } = await verifyDeleteAccount(otp);

      if (data.success) {
        toast.success("Account deleted successfully");

        // logout via API
        try {
          await api.post("/api/auth/logout");
        } catch (err) {
          console.error("Logout error:", err);
        }

        // clear user data
        setUserData(null);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-red-600">Delete Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* STEP 1: WARNING */}
        {step === "warning" && (
          <>
            <p className="text-sm text-gray-700">
              This action is{" "}
              <span className="font-semibold text-red-600">permanent</span>. All
              your data including chats and appointments will be deleted.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border">
                Cancel
              </button>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <>
            <p className="text-sm text-gray-700 mb-4">
              Enter the 6-digit OTP sent to your email.
            </p>

            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full border rounded-lg px-3 py-2 text-center tracking-widest text-lg"
              placeholder="••••••"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border">
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;
