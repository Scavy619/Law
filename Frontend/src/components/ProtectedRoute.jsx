import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

export default function ProtectedRoute({ children }) {
  const { userData, authLoading } = useContext(AppContext);

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userData) {
    toast.warn("You must be logged in to access this page.");
    return <Navigate to="/login" replace />;
  }

  return children;
}
