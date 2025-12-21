import styles from './Home.module.css';


const Home = () => {
  return (
    <div className={styles.home}>
      <h1 className={styles.headline}> Welcome to Trust Me Sis</h1>
      <p className={styles.description}>
        Your go-to platform for managing profiles, settings, and exploring exciting features.
      </p>
        <p className={styles.description}>
        Navigate through the app using the links above to get started!
      </p>
       
    </div>
  );
};

export default Home;
