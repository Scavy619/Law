import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyMagicLink } from "../api/user.api.js";
import { setAccessToken } from "../context/auth.tokens.js";
import useApp from "../context/useApp.jsx";
import { toast } from "react-toastify";

const VerifyMagicLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUserData } = useApp();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await verifyMagicLink(token);

        if (data.success) {
          setAccessToken(data.accessToken);
          setUserData(data.user);
          setStatus("success");
          toast.success("Logged in successfully!");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    if (token) verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-sm">
        {status === "verifying" && (
          <>
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Verifying your magic link...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">Logged in successfully!</p>
            <p className="text-gray-500 text-sm mt-1">Redirecting you...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">Link invalid or expired</p>
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