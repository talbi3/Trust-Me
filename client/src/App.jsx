import { BrowserRouter, Routes, Route, Link } from 'react-router'
import Home from './pages/HomePage/HomePage';
import styles from './styles/App.module.css';
import Settings from './pages/SettingsPage/SettingsPage';
 
import projectLogo from './assets/project-logo.png'

function App() {
  
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <Link to="/">
            <img src={projectLogo} alt="Logo" className={styles.appLogo} />
          </Link>
          <nav className={styles.appNav}>
            <Link to="/settings" className={styles.appLink}>Settings</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
           </Routes>
        </main>
        <footer className={styles.footer}>
          <p>&copy; 2025 Trust Me Sis</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
