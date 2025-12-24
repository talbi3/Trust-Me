import { useNavigate } from "react-router-dom";
import WelcomeMessage from '../../components/chat/WelcomeMessage/WelcomeMessage';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header Section */}
        <div className={styles.header}>
       
        </div>

        {/* Dynamic Welcome Message */}
        <div className={styles.messageWrapper}>
          <WelcomeMessage />
        </div>

        {/* Description */}
        <p className={styles.description}>
          Your go-to platform for safety guidance. Manage your profile, 
          explore features, and chat with our assistant anytime.
        </p>

        {/* Action Buttons */}
        <div className={styles.buttonGroup}>
          <button 
            className={styles.primaryButton}
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={() => navigate('/chat')}
          >
            Go to Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;