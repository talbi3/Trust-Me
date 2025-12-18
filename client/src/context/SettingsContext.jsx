import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    notifications: { email: false, push: false },
    connectors: [],
  });

  // State to store original data from server for comparison and reset functionality
  const [serverSettings, setServerSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State to handle the visibility of the success feedback message
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Fetches settings from the backend.
   * Updates both local 'settings' draft and 'serverSettings' source of truth.
   */
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/user/settings');
      setSettings(response.data);
      setServerSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSettings();
    });
  }, [fetchSettings]);

  /**
   * Sends the local draft to the server.
   * On success: Updates serverSettings to match draft and triggers a timed success message.
   */
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/api/user/settings', settings);
      
      // Check if backend returned success
      if (response.data.success) {
        setServerSettings(settings); // Sync draft with server state to hide SaveBar
        
        // Show success feedback
        setShowSuccess(true);
        
        // Auto-hide success message after 3 seconds for better UX
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Updates local notification state only (Draft mode)
   */
  const toggleNotification = (type) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  /**
   * Updates local connectors array state only (Draft mode)
   */
  const toggleConnector = (appId, currentStatus) => {
    const updatedConnectors = settings.connectors.map(app =>
      app.id === appId ? { ...app, connected: !currentStatus } : app
    );
    
    setSettings(prev => ({
      ...prev,
      connectors: updatedConnectors
    }));
  };

  /**
   * UI Helper: Returns true if the local draft differs from the last saved server state
   */
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(serverSettings);

  const value = {
    settings,
    loading,
    isSaving,
    hasChanges,
    showSuccess,    // Used by SettingsPage to render the success toast
    saveSettings,
    fetchSettings,  // Can be used as a "Reset" function
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