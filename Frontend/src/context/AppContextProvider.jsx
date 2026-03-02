import { useEffect, useState, useCallback } from "react";
import { AppProvider } from "./AppContext";
import { appActions } from "./app.actions";
import api from "../api/axiosClient";
import { rateLimitEmitter } from "../api/axiosClient";
import { setAccessToken } from "./auth.tokens";

const AppContextProvider = ({ children }) => {
  const currencySymbol = "₹";

  // global state
  const [lawyers, setLawyers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // chat state
  const [sessionId, setSessionId] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loadingResponse, setLoadingResponse] = useState(false);

  // rate limiting state
  const [rateLimitCooldown, setRateLimitCooldown] = useState(false);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(null);

  const actions = appActions({
    setLawyers,
    setUserData,
    setSessionId,
    setCurrentSession,
  });

  // 🔐 INIT AUTH (refresh token flow)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.post("/api/auth/refresh");
        setAccessToken(data.accessToken);
        setUserData(data.user);
      } catch (error) {
        // Only log non-401 errors (401 means no refresh token, which is normal)
        if (error.response?.status !== 401) {
          // console.error("Auth initialization error:", error);
        }
        setUserData(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // 🚦 Wire up global rate-limit events from axios interceptor
  useEffect(() => {
    const handleRateLimit = ({ cooldownMs }) => {
      setRateLimitCooldown(true);
      setTimeout(() => setRateLimitCooldown(false), cooldownMs);
    };

    const handleCreditsExhausted = () => {
      setCreditsExhausted(true);
      setCreditsRemaining(0);
    };

    rateLimitEmitter.on("rate-limited", handleRateLimit);
    rateLimitEmitter.on("credits-exhausted", handleCreditsExhausted);

    return () => {
      rateLimitEmitter.off("rate-limited", handleRateLimit);
      rateLimitEmitter.off("credits-exhausted", handleCreditsExhausted);
    };
  }, []);

  // initial data
  useEffect(() => {
    actions.getLawyersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppProvider
      value={{
        currencySymbol,

        lawyers,
        userData,
        setUserData,
        authLoading,

        sessionId,
        setSessionId,
        currentSession,
        setCurrentSession,

        loadingResponse,
        setLoadingResponse,

        rateLimitCooldown,
        setRateLimitCooldown,
        creditsExhausted,
        setCreditsExhausted,
        creditsRemaining,
        setCreditsRemaining,

        ...actions,
      }}
    >
      {children}
    </AppProvider>
  );
};

export default AppContextProvider;
