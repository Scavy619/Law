import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import Loader from "./common/Loader";

export default function ProtectedRoute({ children }) {
  const { userData, authLoading } = useContext(AppContext);

  // Show nothing while checking auth
  if (authLoading) {
    return <Loader minHeight="min-h-screen" />;
  }

  // Redirect to login if not authenticated
  if (!userData) {
    toast.warn("You must be logged in to access this page.");
    return <Navigate to="/login" replace />;
  }

  return children;
}
