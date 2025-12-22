import Button from '../common/Button/Button.jsx';   
import styles from './BottomActionBar.module.css'; 
import { useSettings } from  '../../hooks/useSettings.js';


/**
 * Bottom bar that toggles between "Unsaved Changes" and "Success" states
 */
const BottomActionBar = () => {
  const { hasChanges, saveSettings, isSaving, showSuccess } = useSettings();

  // Don't render anything if there are no changes and no success message to show
  if (!hasChanges && !showSuccess) return null;

  return (
    <div className={`${styles.saveBar} ${showSuccess ? styles.successMode : ''}`}>
      <p className={styles.saveMessage}>
        {showSuccess ? 'Settings saved successfully!' : 'You have unsaved changes!'}
      </p>
      
      {!showSuccess && (
        <div className={styles.saveActions}>
          <Button variant="primary" onClick={saveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BottomActionBar;