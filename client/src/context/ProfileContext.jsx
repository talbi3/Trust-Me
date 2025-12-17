import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

// create context
const ProfileContext = createContext();

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // GET /api/user/profile
  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/user/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // PUT /api/user/profile
  const updateProfile = async (updatedProfile) => {
    try {
      const response = await api.put('/api/user/profile', updatedProfile);
      if (response.data?.success) {
        setProfile(updatedProfile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  // load profile once when app starts (like DuckContext)
  useEffect(() => {
    getProfile();
  }, []);

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
