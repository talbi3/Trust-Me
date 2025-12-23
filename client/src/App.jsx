import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';  
import Home from './pages/HomePage/HomePage.jsx';
import styles from './styles/App.module.css';
import Profile from './pages/ProfilePage/ProfilePage.jsx';
import Settings from './pages/SettingsPage/SettingsPage.jsx';
import Login from './pages/LoginPage/LoginPage.jsx';
import Chat from "./pages/ChatPage/ChatPage.jsx";
import { UserContext } from './context/UserContext.jsx';  

import projectLogo from './assets/project-logo.png';

function App() {
   const { user, logout } = useContext(UserContext);
   console.log("Current User in App:", user);

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <Link to="/">
            <img src={projectLogo} alt="Logo" className={styles.appLogo} />
          </Link>
          
          <nav className={styles.appNav}>
            {user ? (
              <>
                <Link to="/profile" className={styles.appLink}>Profile</Link>
                <Link to="/settings" className={styles.appLink}>Settings</Link>
                <Link to="/chat" className={styles.appLink}>Chat</Link>
                
                <button 
                  onClick={logout} 
                  className={`${styles.appLink} ${styles.logoutBtn}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={styles.appLink}>Login</Link>
            )}
          </nav>
        </header>
        
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings/*" element={user ? <Settings /> : <Login />} />
            <Route path="/profile" element={user ? <Profile /> : <Login />} />
            <Route path="/chat" element={user ? <Chat /> : <Login />} />
            <Route path="/login" element={<Login />} />
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