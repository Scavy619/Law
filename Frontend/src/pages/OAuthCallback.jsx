import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosClient";
import useApp from "../context/useApp.jsx";
import { setAccessToken } from "../context/auth.tokens.js";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUserData } = useApp();

  useEffect(() => {
    let isMounted = true;

    const finalizeLogin = async () => {
      try {
        const { data } = await api.post("/api/auth/refresh");

        if (!isMounted) return;

        setAccessToken(data.accessToken);
        setUserData(data.user);
        navigate("/", { replace: true });
      } catch (error) {
        if (!isMounted) return;

        toast.error("Google login failed. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    finalizeLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, setUserData]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-600">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p>Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
