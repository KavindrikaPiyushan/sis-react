import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage, sessionStorage, or API call)
    checkAuthStatus();

  }, []);

  useEffect(()=>{
    console.log("user:::",user);
  },[user])

 const checkAuthStatus = async () => {
    try {
      console.log("=== Checking auth status ===");
      
      // Add debugging for localStorage
      console.log("All localStorage keys:", Object.keys(localStorage));
      console.log("localStorage length:", localStorage.length);
      
      // Check localStorage for token
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");
      
      console.log("Retrieved token:", token);
      console.log("Retrieved userData:", userData);
      console.log("Token exists:", !!token);
      console.log("UserData exists:", !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("Parsed user data:", parsedUser);
          setUser(parsedUser);
          console.log("User set successfully");
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      } else {
        console.log("No valid token/userData found in localStorage");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    } finally {
      setIsLoading(false);
      console.log("=== Auth check completed ===");
    }
  };

 
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
   
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};