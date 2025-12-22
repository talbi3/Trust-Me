import { createContext, useState, useEffect } from "react";
import api from "../services/api"; 
import PropTypes from 'prop-types';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error( "Failed to parse user from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email) => {
    try {
      const res = await api.post("/api/auth/login", { email });
      
      const userData = res.data.user;
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData)); 
      return { success: true };

    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.error || "Login failed" 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout"); 
    } catch (err) {
      console.log("Logout request failed, clearing local state anyway", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      window.location.href = "/"; 
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, setUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserContext, UserProvider };