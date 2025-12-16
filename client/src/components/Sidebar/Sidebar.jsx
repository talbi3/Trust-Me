import PropTypes from 'prop-types';
import styles from './Sidebar.module.css';

const Sidebar = ({ items, activeTab, onTabChange }) => {
  return (
    <div className={styles.container}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`${styles.navButton} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className={styles.iconWrapper}>
            {item.icon}
          </span>
          {item.label}
        </button>
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