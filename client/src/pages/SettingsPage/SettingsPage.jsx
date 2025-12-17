import { useNavigate, Outlet, useLocation } from 'react-router';
import { FiBell, FiUsers, FiCommand } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar/Sidebar.jsx'; 
import styles from './Settings.module.css'; 
import { SettingsProvider } from '../../context/SettingsContext.jsx';  

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleClose = () => navigate('/');

  const handleTabChange = (tabId) => {
     navigate(tabId.toLowerCase());
  };

  const currentTab = location.pathname.split('/').pop(); 

  const menuItems = [
    { id: 'notifications', icon: <FiBell size={18} />, label: 'Notifications' },
    { id: 'apps-and-connectors', icon: <FiCommand size={18} />, label: 'Apps and Connectors' },
    { id: 'parental-controls', icon: <FiUsers size={18} />, label: 'Parental Controls' },
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
          <Outlet />
        </div>
        
      </div>
    </div>
    </SettingsProvider>
  );
};

export default SettingsPage;