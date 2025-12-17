import PropTypes from 'prop-types';
import styles from './ToggleSwitch.module.css';

const ToggleSwitch = ({ isChecked, onChange }) => {
  return (
    <label className={styles.toggleSwitch}>
      <input 
        type="checkbox" 
        className={styles.toggleInput} 
        checked={isChecked} 
        onChange={onChange} 
      />
      <span className={styles.slider}></span>
    </label>
  );
};

ToggleSwitch.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ToggleSwitch;