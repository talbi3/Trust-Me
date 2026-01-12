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

  // --- NEW: Helper to check if link is active ---
  const getLinkStyle = (path) => {
    // Check if the current URL starts with the path (good for /chat vs /chat/123)
    // Or exact match for others
    const isActive = path === '/chat' 
      ? location.pathname.startsWith('/chat') 
      : location.pathname === path;

    if (isActive) {
      return { 
        fontWeight: "bold",      // Visual clue
        opacity: 0.6,            // Visual clue (dimmed)
        pointerEvents: "none",   // DISABLES CLICK - The logic you asked for
        cursor: "default"        // Shows regular cursor instead of hand
      };
    }
    return {}; // Default style
  };

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <Link to="/">
          <img src={projectLogo} alt="Logo" className={styles.appLogo} />
        </Link>

        {!isOnboarding && (
          <nav className={styles.appNav}>
            {user && (
              <>
                <Link 
                  to="/profile" 
                  className={styles.appLink}
                  style={getLinkStyle('/profile')} 
                >
                  Profile
                </Link>

                <Link 
                  to="/settings" 
                  className={styles.appLink}
                  style={getLinkStyle('/settings')}
                >
                  Settings
                </Link>

                <Link 
                  to="/chat" 
                  className={styles.appLink}
                  style={getLinkStyle('/chat')}
                >
                  Chat
                </Link>

                <button
                  onClick={logout}
                  className={`${styles.appLink} ${styles.logoutBtn}`}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </header>

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

          <Route
            path="/chat/:id"
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

      
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;