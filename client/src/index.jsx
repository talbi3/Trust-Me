import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; 
import App from './App.jsx';
import { DuckProvider } from './context/DuckContext';
import { ProfileProvider } from './context/ProfileContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DuckProvider>
      <ProfileProvider>
      <App /> 
      </ProfileProvider>
    </DuckProvider>
  </React.StrictMode>
);