import PropTypes from 'prop-types';
import styles from './SettingsRow.module.css';

const SettingsRow = ({ icon, title, description, action }) => {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        {icon && <div className={styles.icon}>{icon}</div>}
        
        <div className={styles.textWrapper}>
          <div className={styles.title}>{title}</div>
          {description && <div className={styles.description}>{description}</div>}
        </div>
      </div>
      
      <div className={styles.action}>
        {action}
      </div>
    </div>
  );
};

SettingsRow.propTypes = {
  icon: PropTypes.element,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node, 
};

export default SettingsRow;