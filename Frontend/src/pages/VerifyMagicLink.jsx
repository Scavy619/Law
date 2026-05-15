import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyMagicLink, verifyMagicLink2FA } from "../api/user.api.js";
import { setAccessToken } from "../context/auth.tokens.js";
import useApp from "../context/useApp.jsx";
import { toast } from "react-toastify";

const VerifyMagicLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUserData } = useApp();

  // "verifying" | "requires2fa" | "success" | "error"
  const [status, setStatus] = useState("verifying");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await verifyMagicLink(token);

        if (data.requires2FA) {
          setStatus("requires2fa");
          // auto-focus the input after render
          setTimeout(() => inputRef.current?.focus(), 50);
          return;
        }

        if (data.success) {
          setAccessToken(data.accessToken);
          setUserData(data.user);
          setStatus("success");
          toast.success("Logged in successfully!");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    if (token) verify();
  }, [token]);

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const { data } = await verifyMagicLink2FA(token, twoFactorCode.trim());

      if (data.success) {
        setAccessToken(data.accessToken);
        setUserData(data.user);
        setStatus("success");
        toast.success("Logged in successfully!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setErrorMsg(data.message || "Verification failed.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Verification failed.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-sm w-full">
        {/* Verifying spinner */}
        {status === "verifying" && (
          <>
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 text-sm">
              Verifying your magic link...
            </p>
          </>
        )}

        {/* 2FA prompt */}
        {status === "requires2fa" && (
          <>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold text-lg mb-1">
              Two-Factor Authentication
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Enter the 6-digit code from your authenticator app to complete
              login.
            </p>

            <form onSubmit={handle2FASubmit} className="flex flex-col gap-3">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => {
                  setErrorMsg("");
                  setTwoFactorCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  );
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={submitting}
              />

              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

              <button
                type="submit"
                disabled={submitting || twoFactorCode.length !== 6}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {submitting ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-500 hover:text-gray-700 mt-1"
              >
                Back to Login
              </button>
            </form>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">
              Logged in successfully!
            </p>
            <p className="text-gray-500 text-sm mt-1">Redirecting you...</p>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">
              Link invalid or expired
            </p>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Magic links expire in 15 minutes and can only be used once.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-6 py-2 rounded-md text-sm"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyMagicLink;
