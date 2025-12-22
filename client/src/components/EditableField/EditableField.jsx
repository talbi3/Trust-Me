import PropTypes from 'prop-types';
import styles from './EditableField.module.css';

const EditableField = ({ label, value, isEditing, onChange, type = "text" }) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {!isEditing ? (
        <div className={styles.readOnlyValue}>{value}</div>
      ) : (
        <input
          className={styles.input}
          type={type}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};



EditableField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
};

export default EditableField;