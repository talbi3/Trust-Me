import { useState } from 'react';
import ToggleSwitch from '../../../components/common/ToggleSwitch/ToggleSwitch.jsx'; 
import styles from './NotificationsTab.module.css';
const NotificationsTab = () => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  return (
    <div className={styles.container}>
      
      <div className={styles.row}>
        <div className={styles.textContainer}>
          <div className={styles.label}>Email Notifications</div>
          <div className={styles.subLabel}>Receive updates about your account activity</div>
        </div>
        
        <ToggleSwitch 
          isChecked={emailEnabled} 
          onChange={() => setEmailEnabled(!emailEnabled)} 
        />
      </div>

      <div className={styles.row}>
        <div className={styles.textContainer}>
          <div className={styles.label}>Push Notifications</div>
          <div className={styles.subLabel}>Receive notifications on your device</div>
        </div>
        
        <ToggleSwitch 
          isChecked={pushEnabled} 
          onChange={() => setPushEnabled(!pushEnabled)} 
        />
      </div>

    </div>
  );
};

export default NotificationsTab;