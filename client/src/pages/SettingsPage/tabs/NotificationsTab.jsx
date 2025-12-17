import ToggleSwitch from '../../../components/common/ToggleSwitch/ToggleSwitch.jsx';
import SettingsRow from '../../../components/SettingsRow/SettingsRow.jsx'; 
import layout from './SettingsLayout.module.css'; 
import { useSettings } from '../../../context/SettingsContext.jsx'; 

const NotificationsTab = () => {
  const { notifications, toggleNotification } = useSettings();


  return (
    <div className={layout.pageContainer}>
      
      <div className={layout.header}>
        <div className={layout.pageTitle}>Notifications</div>
        <div className={layout.pageDescription}>Manage how you receive updates.</div>
      </div>

      <SettingsRow 
        title="Email Notifications"
        description="Receive updates about your account activity"
        action={
          <ToggleSwitch 
            isChecked={notifications.email} 
            onChange={() => toggleNotification('email')} 
          />
        }
      />

      <SettingsRow 
        title="Push Notifications"
        description="Receive notifications on your device"
        action={
          <ToggleSwitch 
            isChecked={notifications.push} 
            onChange={() => toggleNotification('push')} 
          />
        }
      />
    </div>
  );
};

export default NotificationsTab;