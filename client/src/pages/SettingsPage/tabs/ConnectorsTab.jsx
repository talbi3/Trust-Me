import { useState } from 'react';
import { SiYoutube, SiTelegram, SiWhatsapp, SiDiscord } from 'react-icons/si';
import styles from './ConnectorsTab.module.css';
import PropTypes from 'prop-types';
import Button from '../../../components/common/Button/Button.jsx';

const APPS_DATA = [
  { id: 1, name: 'WhatsApp', icon: <SiWhatsapp />, color: '#25D366', desc: 'Analyze group chats for bullying' },
  { id: 2, name: 'Telegram', icon: <SiTelegram />, color: '#26A5E4', desc: 'Flag suspicious secure chats' },
  { id: 3, name: 'YouTube', icon: <SiYoutube />, color: '#FF0000', desc: 'Filter inappropriate content' },
  { id: 4, name: 'Discord', icon: <SiDiscord />, color: '#5865F2', desc: 'Safety in gaming servers' },
];

const AppRow = ({ app }) => {
   const [isConnected, setIsConnected] = useState(false);

  return (
    <div className={styles.appRow}>
      
       <div className={styles.infoSection}>
        <div className={styles.iconWrapper} style={{ color: app.color }}>
          {app.icon}
        </div>
        <div className={styles.textWrapper}>
          <div className={styles.appName}>{app.name}</div>
          <div className={styles.appDesc}>{app.desc}</div>
        </div>
      </div>

       <div className={styles.actionsSection}>
<Button 
          variant={isConnected ? 'danger' : 'secondary'} // אדום אם מחובר, שחור אם לא
          onClick={() => setIsConnected(!isConnected)}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
  
      </div>

    </div>
  );
};

AppRow.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    color: PropTypes.string,
    desc: PropTypes.string,
  }).isRequired,
};

const ConnectorsTab = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.sectionTitle}>Connected Safety Apps</div>
        <div className={styles.sectionDescription}>
          Manage your integrations with third-party platforms.
        </div>
      </div>

      <div className={styles.appsList}>
        {APPS_DATA.map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};

export default ConnectorsTab;