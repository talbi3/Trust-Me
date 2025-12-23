import PropTypes from 'prop-types';
import { Sparkles } from 'lucide-react';
import styles from './CategorySelector.module.css';

const CATEGORIES = [
  { id: 'bullying', label: 'Bullying Support', icon: '🛡️' },
  { id: 'pictures', label: 'Picture Safety', icon: '📸' },
  { id: 'focus', label: 'Focus Help', icon: '🎯' }
];

const CategorySelector = ({ onSelectCategory, userId }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoCircle}>
          <Sparkles className={styles.logoIcon} />
        </div>
        <h1 className={styles.title}>Support Assistant</h1>
        <p className={styles.subtitle}>How can I help you today?</p>
      </div>

      <div className={styles.list}>
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className={styles.card}
          >
            <div className={styles.cardContent}>
              <div className={styles.cardLeft}>
                <span className={styles.emoji}>{category.icon}</span>
                <span className={styles.cardLabel}>{category.label}</span>
              </div>
              <div className={styles.arrow}>→</div>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        Connected as <strong>{userId}</strong>
      </div>
    </div>
  );
};

CategorySelector.propTypes = {
  onSelectCategory: PropTypes.func.isRequired,
  userId: PropTypes.string
};

export default CategorySelector;