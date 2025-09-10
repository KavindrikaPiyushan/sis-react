import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from './authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    AuthService.getProfile().then(res => {
      if (mounted) {
        if (res.success && res.data && res.data.role) {
          setIsAuthenticated(true);
          setUserRole(res.data.role);
          setUser(res.data);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setUser(null);
        }
        setAuthChecked(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Optionally, add a refresh method for re-checking auth after login/logout
  const refreshAuth = async () => {
    setAuthChecked(false);
    const res = await AuthService.getProfile();
    if (res.success && res.data && res.data.role) {
      setIsAuthenticated(true);
      setUserRole(res.data.role);
      setUser(res.data);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
    }
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider value={{ authChecked, isAuthenticated, userRole, user, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
