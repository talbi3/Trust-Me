import { createContext, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";

const ProfileContext = createContext();

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // GET Profile (token-based)
  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/user/profile");
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    setLoading(true);
    try {
      const response = await api.put("/api/user/profile", updatedData);

      if (response.data?.user) {
        setProfile(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        getProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ProfileContext, ProfileProvider };
