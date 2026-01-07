import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import PropTypes from "prop-types";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("googleIdToken");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("user");
        localStorage.removeItem("googleIdToken");
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("googleIdToken");
    }

    setLoading(false);
  }, []);

  const loginWithGoogle = async (idToken) => {
  try {
    const res = await api.post("/api/auth/google", { idToken });

    const userData = res.data.user;
    const needsOnboarding = !!res.data.needsOnboarding;

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("googleIdToken", idToken); 

    return { success: true, needsOnboarding };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      message: error.response?.data?.error || "Google login failed",
    };
  }
};


  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("googleIdToken");
      window.location.href = "/login";
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserContext, UserProvider };
