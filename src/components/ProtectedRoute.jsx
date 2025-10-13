
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/authService";

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await AuthService.getProfile();
        if (isMounted) {
          if (res.success && res.data) {
            setUser(res.data);
            setAuthChecked(true);
          } else {
            setError("unauthenticated");
            setAuthChecked(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("unauthenticated");
          setAuthChecked(true);
        }
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  


  if (!authChecked) {
    // Show loading spinner or placeholder while checking auth
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (error === "unauthenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles) {
    const rolesArr = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!rolesArr.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  } else if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized
  return children;
};

export default ProtectedRoute;