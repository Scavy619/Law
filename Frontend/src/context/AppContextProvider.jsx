import { useEffect, useState } from "react";
import { AppProvider } from "./AppContext";
import { appActions } from "./app.actions";

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currencySymbol = "₹";

  // global state
  const [lawyers, setLawyers] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userData, setUserData] = useState(null);

  // chat state
  const [sessionId, setSessionId] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loadingResponse, setLoadingResponse] = useState(false);

  // persist token
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const actions = appActions({
    backendUrl,
    token,
    setLawyers,
    setUserData,
    setSessionId,
    setCurrentSession,
  });

  // initial data
  useEffect(() => {
    actions.getLawyersData();
  }, []);

  useEffect(() => {
    token ? actions.loadUserProfileData() : setUserData(null);
  }, [token]);

  return (
    <AppProvider
      value={{
        currencySymbol,
        backendUrl,

        lawyers,
        token,
        setToken,

        userData,
        setUserData,

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
