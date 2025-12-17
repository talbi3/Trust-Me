import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import Button from '../../../components/common/Button/Button.jsx';
import layout from './SettingsLayout.module.css';

const ParentalControlsTab = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className={layout.pageContainer}>
      
      <div className={layout.header}>
        <div className={layout.pageTitle}>Parental controls</div>
        <div className={layout.pageDescription}>
          Your parent or guardian will be able to adjust certain features, set time limits, and add safeguards.
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Button 
          variant="outline" 
          onClick={() => setIsInviteOpen(true)}
        >
          <FiPlus /> Add family member
        </Button>
      </div>

      {isInviteOpen && (
        <div className={layout.modalOverlay}>
          <div className={layout.modalContent}>
            
            <div className={layout.modalTitle}>Invite family member</div>
            <FiX className={layout.closeIcon} onClick={() => setIsInviteOpen(false)} />

            <div>
              <div className={layout.labelRow}>
                <span>Email address</span>
              </div>
              <input 
                type="email" 
                placeholder="name@email.com" 
                className={layout.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className={layout.helperText}>
                If your family member is new to our Platform, they&apos;ll be asked to create an account.
              </div>
            </div>

            <div className={layout.buttonRow}>
              <Button 
                variant="outline" 
                onClick={() => setIsInviteOpen(false)}
              >
                Cancel
              </Button>
              
              <Button 
                variant={email ? 'secondary' : 'outline'}
                disabled={true} 
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