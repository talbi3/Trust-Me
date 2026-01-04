import { createContext, useState, useEffect, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { UserContext } from "./UserContext";

const SettingsContext = createContext();

const SettingsProvider = ({ children }) => {
  const { user } = useContext(UserContext);

  const [settings, setSettings] = useState({
    notifications: { email: false, push: false },
    connectors: [],
  });

  const [serverSettings, setServerSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get("/api/user/settings");
      setSettings(response.data);
      setServerSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [fetchSettings, user]);

  const saveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await api.put("/api/user/settings", settings);

      if (response.data?.success || response.status === 200) {
        setServerSettings(settings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (type) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const toggleConnector = (appId, currentStatus) => {
    const updatedConnectors = settings.connectors.map((app) =>
      app.id === appId ? { ...app, connected: !currentStatus } : app
    );
    setSettings((prev) => ({ ...prev, connectors: updatedConnectors }));
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(serverSettings);

  const value = {
    settings,
    loading,
    isSaving,
    hasChanges,
    showSuccess,
    saveSettings,
    fetchSettings,
    connectors: settings.connectors,
    notifications: settings.notifications,
    toggleConnector,
    toggleNotification,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SettingsContext, SettingsProvider };
