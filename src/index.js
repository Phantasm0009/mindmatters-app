import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/main.css';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

// This will hold the deferred prompt for installation
window.deferredPrompt = null;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67+ from automatically showing the prompt
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  window.deferredPrompt = e;
  
  console.log('App can be installed');
});

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  // Clear the deferredPrompt so it can't be used again
  window.deferredPrompt = null;
  console.log('PWA installed successfully');
});

// Handle offline status initially
if (!navigator.onLine) {
  document.body.classList.add('offline-mode');
}

// Listen for online/offline events
window.addEventListener('online', () => document.body.classList.remove('offline-mode'));
window.addEventListener('offline', () => document.body.classList.add('offline-mode'));

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);