import PropTypes from 'prop-types';
import styles from './SettingsItem.module.css';

const SettingsItem = ({ label, subLabel, type = 'custom', options = [], defaultValue, children }) => {
  
  const renderControl = () => {
    switch (type) {
      case 'select':
        return (
          <select className={styles.selectInput} defaultValue={defaultValue}>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'toggle':
        return (
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              className={styles.toggleInput} 
              defaultChecked={defaultValue} 
            />
            <span className={styles.slider}></span>
          </label>
        );

      case 'custom':
      default:
        return children;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        <span className={styles.label}>{label}</span>
        {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
      </div>
      
      <div className={styles.control}>
        {renderControl()}
      </div>
    </div>
  );
};

SettingsItem.propTypes = {
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string,
  type: PropTypes.oneOf(['select', 'toggle', 'custom']),
  options: PropTypes.arrayOf(PropTypes.string), 
  defaultValue: PropTypes.any,
  children: PropTypes.node,
};

export default SettingsItem;