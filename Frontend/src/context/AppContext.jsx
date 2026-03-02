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

  // rate limiting
  rateLimitCooldown: false, // true for 10s when global 429 hits
  setRateLimitCooldown: () => {},
  creditsExhausted: false, // true when 403 daily credit limit hits
  setCreditsExhausted: () => {},

  // credits
  creditsRemaining: null, // null = not yet loaded, number = known value
  setCreditsRemaining: () => {},

  createNewChat: () => {},
  fetchUserChats: () => {},
});

export const AppProvider = AppContext.Provider;
