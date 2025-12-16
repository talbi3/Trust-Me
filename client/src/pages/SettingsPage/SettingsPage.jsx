import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiSettings, FiBell, FiPenTool, FiDatabase, FiShield,FiCommand  } from 'react-icons/fi';
import styles from './Settings.module.css';

import SettingsItem from '../../components/SettingsItem/SettingsItem.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';


const Settings = () => {

  const [activeTab, setActiveTab] = useState('General');
  const navigate = useNavigate();
  const handleClose = () => {
      navigate(-1); 
    };
  const menuItems = [
    { id: 'General', icon: <FiSettings size={18} />, label: 'General' },
    { id: 'Notifications', icon: <FiBell size={18} />, label: 'Notifications' },
    { id: 'Personalization', icon: <FiPenTool size={18} />, label: 'Personalization' },
    { id: 'Apps & Connectors', icon: <FiCommand size={18} />, label: 'Connectors' },
    { id: 'Data Controls', icon: <FiDatabase size={18} />, label: 'Data controls' },
    { id: 'Security', icon: <FiShield size={18} />, label: 'Security' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <>
            <div className={styles.headerTitle}>General</div>
            <SettingsItem 
              label="Theme" 
              type="select" 
              options={['System', 'Dark', 'Light']} 
              defaultValue="System" 
            />
            <SettingsItem label="Accent Color">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FF7D9C' }}></div>
                  <span style={{ fontSize: '14px', color: '#666' }}>Pink (Default)</span>
                </div>
            </SettingsItem>
            <SettingsItem 
              label="Language" 
              type="select" 
              options={['Auto-detect', 'English', 'Hebrew']} 
              defaultValue="Auto-detect" 
            />
          </>
        );
        
      case 'Notifications':
        return (
          <>
              <div className={styles.headerTitle}>Notifications</div>
              <SettingsItem
                label="Email Notifications"
                subLabel="Receive updates about your account activity"
                type="toggle"
                defaultValue={true}
              />
          </>
        );

      case 'Personalization':
        return (
            <>
                <div className={styles.headerTitle}>Personalization</div>
                <SettingsItem label="Duck Name">
                    <input 
                      type="text" 
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} 
                      placeholder="Change duck name..." 
                    />
                </SettingsItem>
            </>
        );

      default:
        return <div>Coming soon...</div>;
    }
  };

    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <button className={styles.closeButton} onClick={handleClose}>&times;</button>
          <Sidebar 
              items={menuItems} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
          />

          <div className={styles.content}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
};

export default Settings;