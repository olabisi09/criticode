import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Loading component
const AuthLoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-gray-600">Checking authentication...</p>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check authentication status on mount
        await checkAuth();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    // Only run if not already authenticated and not already initialized
    if (!isAuthenticated && !isInitialized) {
      initializeAuth();
    } else if (isAuthenticated) {
      setIsInitialized(true);
    }
  }, [checkAuth, isAuthenticated, isInitialized]);

  // Store the intended destination before redirecting to login
  const storeIntendedDestination = () => {
    const intendedPath = location.pathname + location.search;

    // Don't store login/register paths as intended destinations
    if (intendedPath !== "/login" && intendedPath !== "/register") {
      localStorage.setItem("intendedDestination", intendedPath);
    }
  };

  // Show loading spinner while checking auth or during initial load
  if (isLoading || !isInitialized) {
    return <AuthLoadingSpinner />;
  }

  // If not authenticated, store intended destination and redirect to login
  if (!isAuthenticated) {
    storeIntendedDestination();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
