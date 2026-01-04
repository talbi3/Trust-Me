import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; 
import App from './App.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <UserProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
