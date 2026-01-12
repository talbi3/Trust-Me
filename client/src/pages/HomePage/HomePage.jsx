import { useContext } from "react"; // 1. Import useContext
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext"; // 2. Import UserContext
import WelcomeMessage from '../../components/chat/WelcomeMessage/WelcomeMessage';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  // 3. Get the user status from context
  const { user } = useContext(UserContext);

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

        {/* Action Buttons - Logic Change Here */}
        <div className={styles.buttonGroup}>
          {!user ? (
            /* View for Guest (Not Logged In) */
            <button 
              className={styles.primaryButton}
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
          ) : (
            /* View for Logged In User */
            <button 
              className={styles.secondaryButton} // Or change to primaryButton if you want it prominent
              onClick={() => navigate('/chat')}
            >
              Go to Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;