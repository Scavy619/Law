import { useContext } from "react";
import { AppContext } from "./AppContext";

// custom hook which we can use for App Context

export default function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppContextProvider");
  }

  return context;
}
