import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    notifications: { email: false, push: false },
    connectors: [],
  });
  

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/user/settings');
        
        setSettings(prev => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } 
    };
    fetchSettings();
  }, []);

  const updateSettingsAPI = async (updatedPart) => {
    setSettings(prev => ({ ...prev, ...updatedPart }));

    try {
      await api.put('/api/user/settings', updatedPart);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };


  const toggleNotification = (type) => {
    const updatedNotifications = {
      ...settings.notifications,
      [type]: !settings.notifications[type]
    };
    updateSettingsAPI({ notifications: updatedNotifications });
  };

  const toggleConnector = (appId, currentStatus) => {
    const updatedConnectors = settings.connectors.map(app =>
      app.id === appId ? { ...app, connected: !currentStatus } : app
    );
    updateSettingsAPI({ connectors: updatedConnectors });
  };

  const value = {
    settings,
    connectors: settings.connectors,       
    notifications: settings.notifications, 
    toggleConnector,
    toggleNotification,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};


