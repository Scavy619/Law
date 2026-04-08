import React, { useState, useEffect } from "react";
import useApp from "../context/useApp";
import DeleteAccountModal from "./DeleteAccountModal";
import { updateUserProfile, forgotPassword } from "../api/user.api";
import { toast } from "react-toastify";
import { setup2FA, verify2FA, disable2FA } from "../api/user.api";
import { exportAllChats } from "../api/chat.api";

import Setup2FAModal from "../components/two_fa/Setup2FAModal";
import Verify2FAModal from "../components/two_fa/Verify2FAModal";
import Disable2FAModal from "../components/two_fa/Disable2FAModal";

/* ================= IMAGE VALIDATION CONFIG ================= */
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const MyProfile = () => {
  const { userData, setUserData, loadUserProfileData } = useApp();

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [setup2FAData, setSetup2FAData] = useState(null);
  const [showVerify2FA, setShowVerify2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  /* ================= LOAD FRESH USER DATA ON MOUNT ================= */
  useEffect(() => {
    loadUserProfileData();
  }, []);

  // image change type
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG and PNG images are allowed");
      e.target.value = "";
      return;
    }

    // size check
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image size must be less than 2MB");
      e.target.value = "";
      return;
    }

    setImage(file);
  };

  // profile update handler
  const updateUserProfileData = async () => {
    try {
      if (image && image.size > MAX_SIZE_BYTES) {
        toast.error("Invalid image selected");
        return;
      }

      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append(
        "address",
        JSON.stringify({
          Location: userData.address?.Location ?? "",
          City: userData.address?.City ?? "",
          State: userData.address?.State ?? "",
        }),
      );
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      image && formData.append("image", image);

      const { data } = await updateUserProfile(formData);

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Profile update failed");
    }
  };

  // reset password handler
  const handlePasswordReset = async () => {
    setResetLoading(true);
    try {
      const { data } = await forgotPassword(userData.email);
      toast.success(data.message || "Password reset email sent!");
    } catch {
      toast.error("Could not send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  // handlers for 2fa

  const handleEnable2FA = async () => {
    try {
      const { data } = await setup2FA();
      setSetup2FAData(data);
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not start 2FA setup";
      toast.error(message);
      console.error("2FA Setup Error:", error.response?.data);
    }
  };

  const handleVerify2FA = async (code) => {
    try {
      const { data } = await verify2FA(code);
      toast.success(data.message || "2FA enabled successfully");
      setSetup2FAData(null);
      setShowVerify2FA(false);
      await loadUserProfileData();
    } catch (error) {
      const message = error.response?.data?.message || "Invalid 2FA code";
      toast.error(message);
      console.error("2FA Verification Error:", error.response?.data);
    }
  };

  const handleDisable2FA = async (payload) => {
    try {
      const { data } = await disable2FA(payload);
      toast.success(data.message || "2FA disabled successfully");
      setShowDisable2FA(false);
      await loadUserProfileData();
    } catch (error) {
      const message = error.response?.data?.message || "Could not disable 2FA";
      toast.error(message);
      console.error("2FA Disable Error:", error.response?.data);
    }
  };

  // handler for exporting chat
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await exportAllChats();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `lawbridge-chats-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export chats");
    } finally {
      setIsExporting(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          My Profile
        </h1>
        {isEdit ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEdit(false);
                setImage(null);
              }}
              className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={updateUserProfileData}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium shadow-lg shadow-primary/30"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="px-6 py-2.5 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 flex flex-col md:flex-row gap-8 items-center">
        <label className={`relative group ${isEdit ? "cursor-pointer" : ""}`}>
          <img
            src={image ? URL.createObjectURL(image) : userData.image}
            className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
            alt="Profile"
          />
          {isEdit && (
            <>
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  Change Photo
                </span>
              </div>
            </>
          )}
        </label>

        <div className="flex-1 space-y-3 text-center md:text-left">
          {isEdit ? (
            <input
              className="text-3xl font-bold border-b-2 border-gray-300 w-full focus:outline-none focus:border-primary bg-transparent"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          ) : (
            <p className="text-3xl font-bold text-gray-800">{userData.name}</p>
          )}
          <p className="text-gray-500 text-lg">{userData.email}</p>
        </div>
      </div>

      {/* ================= PERSONAL INFO ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          Personal Information
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Phone */}
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Phone Number
            </label>
            {isEdit ? (
              <input
                className="w-full mt-2 border-2 border-gray-300 rounded-lg px-4 py-3"
                value={userData.phone || ""}
                maxLength="10"
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            ) : (
              <p className="mt-2 text-lg">{userData.phone || "Not provided"}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Gender
            </label>
            {isEdit ? (
              <select
                className="w-full mt-2 border-2 border-gray-300 rounded-lg px-4 py-3"
                value={userData.gender}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
              >
                <option>Not Selected</option>
                <option>Male</option>
                <option>Female</option>
                <option>Others</option>
                <option>Rather Not Say</option>
              </select>
            ) : (
              <p className="mt-2 text-lg">{userData.gender}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Date of Birth
            </label>
            {isEdit ? (
              <input
                type="date"
                className="w-full mt-2 border-2 border-gray-300 rounded-lg px-4 py-3"
                value={userData.dob || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
              />
            ) : (
              <p className="mt-2 text-lg">{userData.dob || "Not selected"}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Address
            </label>
            {isEdit ? (
              <div className="space-y-3 mt-2">
                <input
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
                  placeholder="Location / Street"
                  value={userData.address?.Location ?? ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, Location: e.target.value },
                    }))
                  }
                />
                <input
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
                  placeholder="City"
                  value={userData.address?.City ?? ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, City: e.target.value },
                    }))
                  }
                />
                <input
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
                  placeholder="State"
                  value={userData.address?.State ?? ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, State: e.target.value },
                    }))
                  }
                />
              </div>
            ) : (
              <p className="mt-2 text-lg">
                {userData.address?.Location || "—"}
                {userData.address?.City ? `, ${userData.address.City}` : ""}
                {userData.address?.State ? `, ${userData.address.State}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================= ACCOUNT SECURITY ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Account Security
        </h2>

        {/* Password Reset */}
        {userData.authProvider !== "google" ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gray-50 rounded-xl p-6 mb-6">
            <div>
              <p className="text-lg font-medium">Password Reset</p>
              <p className="text-sm text-gray-500">
                Reset your password via email verification
              </p>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="px-8 py-3 rounded-lg bg-primary text-white font-medium disabled:opacity-60"
            >
              {resetLoading ? "Sending..." : "Reset Password"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <svg
              className="w-5 h-5 text-blue-500 flex-shrink-0"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.5 3.1 29.56 1 24 1 14.82 1 7.02 6.48 3.44 14.26l7.08 5.5C12.3 13.62 17.7 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.56-.14-3.08-.4-4.5H24v9h12.67c-.55 2.96-2.2 5.48-4.67 7.17l7.17 5.57C43.5 38.1 46.5 31.8 46.5 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.52 28.76A14.6 14.6 0 0 1 9.5 24c0-1.66.29-3.26.8-4.76l-7.08-5.5A23.9 23.9 0 0 0 1 24c0 3.86.92 7.5 2.56 10.72l6.96-5.96z"
              />
              <path
                fill="#34A853"
                d="M24 47c5.56 0 10.22-1.84 13.63-5l-7.17-5.57C28.78 37.7 26.52 38.5 24 38.5c-6.3 0-11.65-4.12-13.48-9.74l-6.96 5.96C7.06 42.56 14.84 47 24 47z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Signed in with Google
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Password management is handled by your Google account.
              </p>
            </div>
          </div>
        )}

        {/* Two-Factor Authentication */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gray-50 rounded-xl p-6">
          <div>
            <p className="text-lg font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>

          {!userData.twoFactorEnabled ? (
            <button
              onClick={handleEnable2FA}
              className="px-8 py-3 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Enable 2FA
            </button>
          ) : (
            <button
              onClick={() => setShowDisable2FA(true)}
              className="px-8 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Disable 2FA
            </button>
          )}
        </div>
      </div>

      {/* ================= DANGER ZONE ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Danger Zone</h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-red-50 rounded-xl p-6 border border-red-200">
          <div>
            <p className="text-lg font-medium text-red-600">Delete Account</p>
            <p className="text-sm text-red-500">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-8 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}

      {/* ================= 2FA MODALS ================= */}
      {setup2FAData && (
        <Setup2FAModal
          qrCode={setup2FAData.qrCode}
          manualKey={setup2FAData.manualKey}
          onNext={() => setShowVerify2FA(true)}
          onClose={() => setSetup2FAData(null)}
        />
      )}

      {showVerify2FA && (
        <Verify2FAModal
          onVerify={handleVerify2FA}
          onClose={() => setShowVerify2FA(false)}
        />
      )}

      {showDisable2FA && (
        <Disable2FAModal
          onDisable={handleDisable2FA}
          onClose={() => setShowDisable2FA(false)}
          isGoogleUser={userData.authProvider === "google"}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Data & Privacy
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gray-50 rounded-xl p-6">
          <div>
            <p className="text-lg font-medium">Export Your Data</p>
            <p className="text-sm text-gray-500">
              Download all your chats in JSON format
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-8 py-3 rounded-lg bg-primary text-white font-medium shadow-lg shadow-primary/30 hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? "Exporting..." : "Export Chats"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
