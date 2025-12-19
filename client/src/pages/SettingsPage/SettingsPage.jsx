import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router'; 
import { FiBell, FiCommand } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar/Sidebar.jsx'; 
import styles from './Settings.module.css'; 
import { SettingsProvider } from '../../context/SettingsContext.jsx';
import BottomActionBar from '../../components/BottomActionBar/BottomActionBar.jsx';

import NotificationsTab from './tabs/NotificationsTab.jsx';
import ConnectorsTab from './tabs/ConnectorsTab.jsx'; 

 
const Settings = () => {
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

export default Settings;