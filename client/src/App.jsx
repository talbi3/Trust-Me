import { useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import styles from "./styles/App.module.css";

import Home from "./pages/HomePage/HomePage.jsx";
import Profile from "./pages/ProfilePage/ProfilePage.jsx";
import Settings from "./pages/SettingsPage/SettingsPage.jsx";
import Login from "./pages/LoginPage/LoginPage.jsx";
import Chat from "./pages/ChatPage/ChatPage.jsx";
import ChatHistoryPage from "./pages/ChatPage/ChatHistoryPage";
import OnboardingPage from "./pages/OnboardingPage/OnboardingPage.jsx";

import { UserContext } from "./context/UserContext.jsx";
import projectLogo from "./assets/project-logo.png";

/**
 * Inner app content (must be inside BrowserRouter)
 */
function AppContent() {
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";

  const { user, logout } = useContext(UserContext);
  console.log("Current User in App:", user);

  return (
    <div className={styles.app}>
      {/* HEADER – logo always visible, nav hidden during onboarding */}
      <header className={styles.appHeader}>
        <Link to="/">
          <img src={projectLogo} alt="Logo" className={styles.appLogo} />
        </Link>

        {!isOnboarding && (
          <nav className={styles.appNav}>
            {user ? (
              <>
                <Link to="/profile" className={styles.appLink}>
                  Profile
                </Link>
                <Link to="/settings" className={styles.appLink}>
                  Settings
                </Link>
                <Link to="/chat" className={styles.appLink}>
                  Chat
                </Link>

                <button
                  onClick={logout}
                  className={`${styles.appLink} ${styles.logoutBtn}`}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={styles.appLink}>
                Login
              </Link>
            )}
          </nav>
        )}
      </header>

      {/* MAIN */}
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/settings/*"
            element={user ? <Settings /> : <Login />}
          />

          <Route
            path="/profile"
            element={user ? <Profile /> : <Login />}
          />

          <Route
            path="/chat"
            element={user ? <Chat /> : <Login />}
          />

          <Route path="/history" element={<ChatHistoryPage />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/onboarding"
            element={user ? <OnboardingPage /> : <Login />}
          />
        </Routes>
      </main>

      {/* FOOTER – hidden during onboarding */}
      {!isOnboarding && (
        <footer className={styles.footer}>
          <p>&copy; 2026 Trust Me</p>
        </footer>
      )}
    </div>
  );
}

/**
 * App root
 */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
