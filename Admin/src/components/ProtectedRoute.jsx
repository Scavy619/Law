import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loader from "./common/Loader";

const ProtectedRoute = ({ children }) => {
  const { adminData, lawyerData, authLoading } = useContext(AppContext);

  // Show loading while checking authentication
  if (authLoading) {
    return <Loader minHeight="min-h-screen" />;
  }

  // If no admin or lawyer is authenticated, redirect to login
  if (!adminData && !lawyerData) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children components
  return children;
};

export default ProtectedRoute;
