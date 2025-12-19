import { BrowserRouter, Routes, Route, Link } from 'react-router'
import Home from './pages/HomePage/HomePage.jsx';
import styles from './styles/App.module.css';
import Profile from './pages/ProfilePage/ProfilePage.jsx';
import Settings from './pages/SettingsPage/SettingsPage.jsx';
import Feature from './pages/FeaturePage/FeaturePage.jsx';

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
            <Link to="/profile" className={styles.appLink}>Profile</Link>
            <Link to="/settings" className={styles.appLink}>Settings</Link>
            <Link to="/feature" className={styles.appLink}>Feature</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feature" element={<Feature />} />
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
