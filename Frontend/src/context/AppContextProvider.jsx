import { useEffect, useState } from "react";
import { AppProvider } from "./AppContext";
import { appActions } from "./app.actions";
import api from "../api/axiosClient";
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

        ...actions,
      }}
    >
      {children}
    </AppProvider>
  );
};

export default AppContextProvider;
