
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/authService";
import LoadingComponent from "./LoadingComponent";

// Module-level cache so multiple ProtectedRoute instances share the same
// profile request and don't each show their own loading UI.
let authPromise = null;
let cachedUser = null;

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      // If we already have the user cached, use it synchronously.
      if (cachedUser) {
        if (isMounted) {
          setUser(cachedUser);
          setAuthChecked(true);
        }
        return;
      }

      try {
        // Reuse existing in-flight request when present to avoid duplicate
        // network calls and duplicate loading UI from nested route guards.
        if (!authPromise) authPromise = AuthService.getProfile();
        const res = await authPromise;
        if (isMounted) {
          if (res.success && res.data) {
            cachedUser = res.data;
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
   
    return (
      <div className="flex items-center justify-center h-[100vh] ml-[250px]">
        <LoadingComponent message={"Checking authentication..."} />
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