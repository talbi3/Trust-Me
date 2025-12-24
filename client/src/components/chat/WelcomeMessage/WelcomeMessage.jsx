import { Sparkles } from 'lucide-react';
import styles from './WelcomeMessage.module.css';

const WelcomeMessage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Sparkles className={styles.icon} />
      </div>
      <h2 className={styles.title}>Welcome to Mars Support!</h2>
      <p className={styles.text}>
        I am your AI assistant. I can read messages aloud and help you with various topics. 
        <br />
        <strong>Select a category below to get started.</strong>
      </p>
    </div>
  );
};

export default WelcomeMessage;