import PropTypes from 'prop-types';
import styles from './SelectInput.module.css';

const SelectInput = ({ options, value, onChange }) => {
  return (
    <select 
      className={styles.selectInput} 
      value={value} 
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

SelectInput.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
};

export default SelectInput;