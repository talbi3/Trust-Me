import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [connectors, setConnectors] = useState([]);
  const [notifications, setNotifications] = useState({ email: false, push: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, settingsRes] = await Promise.all([
          api.get('/settings/connectors'),
          api.get('/settings/notifications')
        ]);

        setConnectors(appsRes.data.appsData || appsRes.appsData);  
        setNotifications(settingsRes.data.notifications || settingsRes.notifications);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchData();
  }, []);

  const toggleConnector = async (appId, currentStatus) => {
    setConnectors(prev => prev.map(app => 
      app.id === appId ? { ...app, connected: !currentStatus } : app
    ));

    try {
      await api.patch(`/settings/connectors/${appId}`, { 
        connected: !currentStatus 
      });
    } catch (error) {
      console.error("Failed to update connector", error);
    }
  };

  const addFamilyMember = async (email) => {
    try {
      await api.post('/settings/parental-controls', { 
        email, 
        date: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Failed to add family member", error);
    }
  };

  const toggleNotification = async (type) => {
    const newValue = !notifications[type];
    const updatedNotifications = { ...notifications, [type]: newValue };
    
    setNotifications(updatedNotifications);

    try {
      await api.patch('/settings/notifications', { 
        notifications: updatedNotifications 
      });
    } catch (e) {
      console.error("Failed to update notifications", e);
    }
  };

  const value = {
    connectors,
    notifications,
    toggleConnector,
    toggleNotification,
    addFamilyMember
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