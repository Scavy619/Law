import { createContext } from "react";

export const AppContext = createContext({
  // globals
  currencySymbol: "₹",
  backendUrl: "",

  // auth
  token: null,
  setToken: () => {},

  // user
  userData: null,
  setUserData: () => {},

  // lawyers
  lawyers: [],
  getLawyersData: () => {},

  // chat
  sessionId: null,
  setSessionId: () => {},
  currentSession: null,
  setCurrentSession: () => {},
  loadingResponse: false,
  setLoadingResponse: () => {},

  createNewChat: () => {},
  fetchUserChats: () => {},
});

export const AppProvider = AppContext.Provider;
