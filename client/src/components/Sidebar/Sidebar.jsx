import PropTypes from 'prop-types';
import styles from './Sidebar.module.css';
import Button from '../common/Button/Button.jsx';

const Sidebar = ({ items, activeTab, onTabChange }) => {
  return (
    <div className={styles.container}>
      {items.map((item) => (
        <Button
          key={item.id}
          variant="ghost"           
          isActive={activeTab === item.id} 
          onClick={() => onTabChange(item.id)}
        >
          {item.icon} 
          {item.label}
        </Button>
      ))}
    </div>
  );
};

Sidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.element,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Sidebar;