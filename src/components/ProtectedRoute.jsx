import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Adjust the import path as needed

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have required role, redirect appropriately
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has correct role, render the protected component
  return children;
};

export default ProtectedRoute;