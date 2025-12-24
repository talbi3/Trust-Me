import PropTypes from 'prop-types';
import { Volume2, Square } from 'lucide-react';
import styles from './TextToSpeech.module.css';

const TextToSpeech = ({ isActive, onClick, className = '' }) => {
  return (
    <button 
      className={`${styles.button} ${isActive ? styles.active : ''} ${className}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent bubbling
        onClick();
      }}
      title={isActive ? "Stop reading" : "Read aloud"}
      type="button"
    >
      {isActive ? <Square size={16} fill="currentColor" /> : <Volume2 size={18} />}
    </button>
  );
};

TextToSpeech.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default TextToSpeech;