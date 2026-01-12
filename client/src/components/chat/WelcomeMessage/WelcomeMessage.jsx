import { useContext } from 'react';
import { Sparkles } from 'lucide-react';
import { UserContext } from '../../../context/UserContext'; 
import styles from './WelcomeMessage.module.css';

const WelcomeMessage = () => {
  const { user } = useContext(UserContext);

  // UPDATED: Logic to prioritize 'nickName' (Preferred Name)
  const userName = 
    user?.nickName ||      // 1. Try Preferred Name
    user?.firstName ||     // 2. Try First Name
    user?.given_name ||    // 3. Try Google First Name
    user?.name ||          // 4. Fallback to Full Name
    "Friend";              // 5. Default

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Sparkles className={styles.icon} />
      </div>

      <h2 className={styles.title}>
        {user 
          ? `Welcome back, ${userName}!` 
          : "Welcome to Trust Me Chat!"
        }
      </h2>

      <p className={styles.text}>
        I am your AI assistant. I can read messages aloud and help you with various topics. 
        <br />
        
        {user ? (
           <strong>Head over to the chat to verify your safety!</strong>
        ) : (
           <strong>Please log in to get started.</strong>
        )}
      </p>
    </div>
  );
};

export default WelcomeMessage;