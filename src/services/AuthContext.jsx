import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AuthService from './authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const didRun = useRef(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🎭 AuthContext State Update:', {
      authChecked,
      isAuthenticated,
      userRole,
      user: user ? { id: user.id, role: user.role, name: user.name } : null
    });
  }, [authChecked, isAuthenticated, userRole, user]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    let mounted = true;
    let timeoutId;

    console.log('🚀 AuthContext - Starting authentication check');

    // First try to get user from localStorage as fallback
    const fallbackUser = AuthService.getCurrentUser();
    console.log('📱 AuthContext - Fallback user from localStorage:', fallbackUser);

    // If we have a fallback user, set it immediately to prevent loading states
    if (fallbackUser && fallbackUser.role) {
      console.log('⚡ AuthContext - Setting fallback user immediately');
      setUser(fallbackUser);
      setUserRole(fallbackUser.role);
      setIsAuthenticated(true);
      // DO NOT set authChecked here; wait for API check below
    }

    // Timeout fallback: if API call takes too long, set authChecked to true and show error
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.error('⏰ AuthContext - API call timed out, setting authChecked to true');
        setAuthChecked(true);
      }
    }, 7000); // 7 seconds

    // Then try to get fresh data from API (this will override fallback if successful)
    AuthService.getProfile().then(res => {
      if (mounted) {
        clearTimeout(timeoutId);
        console.log('🔄 AuthContext - API response received:', res);

        if (res.success && res.data && res.data.role) {
          console.log('✅ AuthContext - API success, updating with fresh user data:', res.data);
          setUser(res.data);
          setUserRole(res.data.role);
          setIsAuthenticated(true);
          console.log('🎯 AuthContext - Fresh API data updated synchronously');
        } else {
          console.log('⚠️ AuthContext - API failed, keeping fallback user if available');
          // If API fails but we don't have fallback user set yet
          if (!fallbackUser || !fallbackUser.role) {
            console.log('❌ AuthContext - No fallback user available');
            setUser(null);
            setUserRole(null);
            setIsAuthenticated(false);
          }
          // If we already have fallback user, just keep it (already set above)
        }
        // Always set authChecked to true after API completes
        console.log('✅ AuthContext - Setting authChecked TRUE after API completes');
        setAuthChecked(true);
      }
    }).catch(error => {
      clearTimeout(timeoutId);
      console.error('💥 AuthContext - API call failed:', error);

      if (mounted) {
        // If API fails and we don't have fallback user set yet
        if (!fallbackUser || !fallbackUser.role) {
          console.log('❌ AuthContext - API error and no fallback user');
          setUser(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
        // If we already have fallback user, just keep it (already set above)
        console.log('🔄 AuthContext - API failed but keeping fallback user');
        console.log('✅ AuthContext - Setting authChecked TRUE after API error');
        setAuthChecked(true);
      }
    });

    return () => { mounted = false; clearTimeout(timeoutId); };
  }, []);

  // Optionally, add a refresh method for re-checking auth after login/logout
  const refreshAuth = async () => {
    console.log('🔄 RefreshAuth - Starting manual auth refresh');
    setAuthChecked(false);
    
    try {
      const res = await AuthService.getProfile();
      console.log('🔄 RefreshAuth - API response:', res);

      if (res.success && res.data && res.data.role) {
        console.log('✅ RefreshAuth - Success, setting user data');
        setUser(res.data);
        setUserRole(res.data.role);
        setIsAuthenticated(true);
        setAuthChecked(true);
        console.log('🎯 RefreshAuth - Auth state updated synchronously');
      } else {
        console.log('❌ RefreshAuth - Failed, clearing user data');
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    } catch (error) {
      console.error('💥 RefreshAuth - Error:', error);
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
    }
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
