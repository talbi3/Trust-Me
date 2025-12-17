import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import styles from './ParentalControlsTab.module.css';
import Button from '../../../components/common/Button/Button.jsx';

const ParentalControlsTab = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className={styles.container}>
      
      <div className={styles.headerRow}>
        <div className={styles.title}>Parental controls</div>
      </div>

      <div className={styles.description}>
        Your parent or guardian will be able to adjust certain features, set time limits, and add safeguards to help guide your experience.
      </div>

      <Button 
        variant="outline" 
        onClick={() => setIsInviteOpen(true)}
      >
        <FiPlus /> Add family member
      </Button>

      {isInviteOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            
            <div className={styles.modalTitle}>Invite family member</div>
            <FiX className={styles.closeIcon} onClick={() => setIsInviteOpen(false)} />

            <div>
              <div className={styles.labelRow}>
                <span>Email address</span>
              </div>
              <input 
                type="email" 
                placeholder="name@email.com" 
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.helperText}>
              If your family member is new to our Platform, they&apos;ll be asked to create an account.
            </div>

            <div className={styles.buttonRow}>
              <Button 
                variant="outline" 
                onClick={() => setIsInviteOpen(false)}
              >
                Cancel
              </Button>
              
              <Button 
                variant={email ? 'secondary' : 'outline'}
                onClick={() => {
                   if(email) {
                      alert('Invite sent!');
                      setIsInviteOpen(false);
                   }
                }}
              >
                Send
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ParentalControlsTab;