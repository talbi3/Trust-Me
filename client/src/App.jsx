import { BrowserRouter, Routes, Route, Link,Navigate } from 'react-router'
import Home from './pages/HomePage/HomePage';
import styles from './styles/App.module.css';
import Settings from './pages/SettingsPage/SettingsPage';
import NotificationsTab from './pages/SettingsPage/tabs/NotificationsTab';
import ConnectorsTab from './pages/SettingsPage/tabs/ConnectorsTab'; 
import ParentalControlsTab from './pages/SettingsPage/tabs/ParentalControlsTab';

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
            <Route path="/settings" element={<Settings />}>
              <Route index element={<Navigate to="notifications" replace />} /> 
              <Route path="notifications" element={<NotificationsTab />} />
              <Route path="apps-and-connectors" element={<ConnectorsTab />} />
              <Route path="parental-controls" element={<ParentalControlsTab />} />
            </Route>
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
