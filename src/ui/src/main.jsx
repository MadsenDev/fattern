import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/config.js';
import { getTheme, applyTheme } from './themes';

// Initialize theme immediately before React renders to prevent flash
function initializeTheme() {
  try {
    // Read from localStorage (fast, synchronous)
    // This gets updated whenever the theme changes
    const themeId = localStorage.getItem('fattern:theme') || 'light';
    const theme = getTheme(themeId);
    applyTheme(theme);
  } catch (error) {
    console.error('Failed to initialize theme', error);
    // Apply default light theme
    const defaultTheme = getTheme('light');
    applyTheme(defaultTheme);
  }
}

// Initialize theme before React renders
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Don't hide loading screen here - let App component handle it when loading is complete
