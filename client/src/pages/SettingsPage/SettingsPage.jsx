import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router'; 
import { FiBell, FiCommand } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar/Sidebar.jsx'; 
import Button from '../../components/common/Button/Button.jsx';   
import styles from './Settings.module.css'; 
import { SettingsProvider, useSettings } from '../../context/SettingsContext.jsx';

import NotificationsTab from './tabs/NotificationsTab';
import ConnectorsTab from './tabs/ConnectorsTab'; 

/**
 * Bottom bar that toggles between "Unsaved Changes" and "Success" states
 */
const BottomActionBar = () => {
  const { hasChanges, saveSettings, isSaving, fetchSettings, showSuccess } = useSettings();

  // Don't render anything if there are no changes and no success message to show
  if (!hasChanges && !showSuccess) return null;

  return (
    <div className={`${styles.saveBar} ${showSuccess ? styles.successMode : ''}`}>
      <p className={styles.saveMessage}>
        {showSuccess ? 'Settings saved successfully!' : 'You have unsaved changes!'}
      </p>
      
      {!showSuccess && (
        <div className={styles.saveActions}>
          <Button variant="outline" onClick={fetchSettings} disabled={isSaving}>
            Reset
          </Button>
          <Button variant="primary" onClick={saveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleClose = () => navigate('/');

  const handleTabChange = (tabId) => {
    navigate(`/settings/${tabId.toLowerCase()}`);
  };

  const pathSegments = location.pathname.split('/');
  const lastSegment = pathSegments.pop() || pathSegments.pop(); 
  const currentTab = lastSegment === 'settings' ? 'notifications' : lastSegment;

  const menuItems = [
    { id: 'notifications', icon: <FiBell size={18} />, label: 'Notifications' },
    { id: 'apps-and-connectors', icon: <FiCommand size={18} />, label: 'Apps and Connectors' },
  ];

  return (
    <SettingsProvider>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          
          <button className={styles.closeButton} onClick={handleClose}>
            &times;
          </button>

          <Sidebar 
              items={menuItems} 
              activeTab={currentTab} 
              onTabChange={handleTabChange} 
          />

          <div className={styles.content}>
            <Routes>
              <Route index element={<Navigate to="notifications" replace />} />
              <Route path="notifications" element={<NotificationsTab />} />
              <Route path="apps-and-connectors" element={<ConnectorsTab />} />
            </Routes>
          </div>

          <BottomActionBar />
          
        </div>
      </div>
    </SettingsProvider>
  );
};

export default SettingsPage;