import { useContext } from 'react';
import PropTypes from 'prop-types';
import styles from './CategorySelector.module.css';
import { Sparkles, ShieldCheck, Camera, Target, ChevronRight, Youtube} from 'lucide-react';
import { UserContext } from '../../../context/UserContext';

const CATEGORIES = [
  { id: 'Bullying', label: 'Bullying Support', icon: ShieldCheck, color: '#53474F' },
  { id: 'Pictures', label: 'Picture Safety', icon: Camera, color: '#53474F' },
  { id: 'Focus', label: 'Focus Help', icon: Target, color: '#53474F' },
  { id: 'Youtube', label: 'Youtube', icon: Sparkles, color: '#53474F' },
  { id: 'YouTubeAnalysis', label: 'YouTube Video Check', icon: Youtube, color:'#53474F'}
];

const CategorySelector = ({ onSelectCategory }) => {
  // 1. Get user details from Context
  const { user } = useContext(UserContext);

  // 2. Determine display name logic:
  // Priority: Nickname -> First Name -> Google Given Name -> Full Name -> "Friend"
  const displayName =
    user?.nickName ||
    user?.firstName ||
    user?.given_name ||
    user?.name ||
    "Friend";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoCircle}>
          <Sparkles className={styles.logoIcon} />
        </div>
        <h1 className={styles.title}>Support Assistant</h1>
        <p className={styles.subtitle} style={{ marginBottom: 4 }}>This is a safe place. You’re not alone.</p>
        <p className={styles.subtitle} style={{ fontSize: '0.95rem' }}>You can say anything here. I’m listening.</p>
      </div>

      <div className={styles.list}>
        {CATEGORIES.map((category) => {
          const IconComponent = category.icon;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className={styles.card}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardLeft}>
                  <span className={styles.emoji}>
                    <IconComponent size={24} color={category.color} />
                  </span>

                  <span className={styles.cardLabel}>{category.label}</span>
                </div>
                <div className={styles.arrow}><ChevronRight size={20} /></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer with Personalized Slogan */}
      <div className={styles.footer}>
         Let&apos;s Chat Away, <strong>{displayName}</strong>.
      </div>
    </div>
  );
};

CategorySelector.propTypes = {
  onSelectCategory: PropTypes.func.isRequired,
};

export default CategorySelector;