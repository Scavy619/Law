import { createContext } from "react";

export const AppContext = createContext({
  // globals
  currencySymbol: "₹",

  // auth / user
  userData: null,
  setUserData: () => {},
  authLoading: true,

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
