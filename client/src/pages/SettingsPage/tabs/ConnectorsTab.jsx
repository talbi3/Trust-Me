import { SiYoutube, SiTelegram, SiWhatsapp, SiDiscord } from 'react-icons/si';
import Button from '../../../components/common/Button/Button.jsx';
import SettingsRow from '../../../components/SettingsRow/SettingsRow.jsx';
import layout from './SettingsLayout.module.css';
import { useSettings } from '../../../context/SettingsContext.jsx';

const APP_CONFIG = {
  whatsapp: { icon: <SiWhatsapp />, color: '#25D366', desc: 'Analyze group chats' },
  telegram: { icon: <SiTelegram />, color: '#26A5E4', desc: 'Flag suspicious chats' },
  youtube: { icon: <SiYoutube />, color: '#FF0000', desc: 'Filter content' },
  discord: { icon: <SiDiscord />, color: '#5865F2', desc: 'Gaming safety' }
};

const ConnectorsTab = () => {
  const { connectors, toggleConnector } = useSettings();

  return (
    <div className={layout.pageContainer}>
      <div className={layout.header}>
        <div className={layout.pageTitle}>Connected Apps</div>
        <div className={layout.pageDescription}>Integrate with 3rd party platforms.</div>
      </div>

      {connectors.map((app) => {
        const config = APP_CONFIG[app.id];
        if (!config) return null;

        return (
          <SettingsRow
            key={app.id}
            icon={<span style={{ color: config.color, display: 'flex' }}>{config.icon}</span>}
            title={app.name}
            description={config.desc}
            action={
              <Button
                variant={app.connected ? 'danger' : 'secondary'}
                onClick={() => toggleConnector(app.id, app.connected)}
              >
                {app.connected ? 'Disconnect' : 'Connect'}
              </Button>
            }
          />
        );
      })}
    </div>
  );
};

export default ConnectorsTab;