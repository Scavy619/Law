import { useEffect, useState, useMemo } from "react";
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

  // document upload for chatbot
  const [userDocuments, setUserDocuments] = useState([]);
  const [uploadsRemaining, setUploadsRemaining] = useState(2);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const actions = useMemo(
    () =>
      appActions({
        setLawyers,
        setUserData,
        setSessionId,
        setCurrentSession,
        setUserDocuments,
        setUploadsRemaining,
        setUploadingDocument,
      }),
    // setters from useState are guaranteed stable by React — no deps needed
    [],
  );

  // INIT AUTH (refresh token flow)
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

  // Wire up global rate-limit events from axios interceptor
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
    if (userData) actions.loadUserDocuments();
  }, [userData]);

  useEffect(() => {
    if (!userData) {
      setCreditsRemaining(null);
      setCreditsExhausted(false);
      return;
    }

    const remaining = userData?.credits?.remaining;

    if (typeof remaining === "number") {
      setCreditsRemaining(remaining);
      setCreditsExhausted(remaining <= 0);
      return;
    }

    actions.loadUserProfileData();
  }, [userData, actions]);

  const contextValue = useMemo(
    () => ({
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

      userDocuments,
      setUserDocuments,
      uploadsRemaining,
      setUploadsRemaining,
      uploadingDocument,
      setUploadingDocument,

      ...actions,
    }),
    [
      currencySymbol,
      lawyers,
      userData,
      authLoading,
      sessionId,
      currentSession,
      loadingResponse,
      rateLimitCooldown,
      creditsExhausted,
      creditsRemaining,
      userDocuments,
      uploadsRemaining,
      uploadingDocument,
      actions,
    ],
  );

  return <AppProvider value={contextValue}>{children}</AppProvider>;
};

export default AppContextProvider;
