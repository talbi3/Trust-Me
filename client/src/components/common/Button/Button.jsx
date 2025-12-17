import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',  
  type = 'button',
  isActive = false,  
  disabled = false,
  className = '',  
}) => {
  
  let buttonClasses = styles.base;

  if (styles[variant]) {
    buttonClasses += ` ${styles[variant]}`;
  }

  if (variant === 'ghost' && isActive) {
    buttonClasses += ` ${styles.ghostActive}`;
  }

  if (className) {
    buttonClasses += ` ${className}`;
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline', 'ghost']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;