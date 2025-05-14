import React, { useState, useEffect } from 'react';
import './NotificationManager.css';

const NotificationManager = () => {
  const [permissionState, setPermissionState] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00'); // Default: 8:00 PM
  const [showBanner, setShowBanner] = useState(false);

  // Check notification permission status on mount
  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      setPermissionState('unsupported');
      return;
    }

    // Set current permission state
    setPermissionState(Notification.permission);
    
    // Check settings from localStorage
    const storedSettings = localStorage.getItem('notificationSettings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      setNotificationsEnabled(settings.enabled);
      if (settings.reminderTime) {
        setReminderTime(settings.reminderTime);
      }
    }
    
    // Show notification banner after a short delay if permission is default
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Save settings to localStorage and update IndexedDB when they change
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      enabled: notificationsEnabled,
      reminderTime
    }));
    
    // Save to IndexedDB for service worker access
    saveSettingsToIndexedDB({
      enabled: notificationsEnabled,
      reminderTime: parseInt(reminderTime.split(':')[0], 10) // Extract hour
    });
    
    // Schedule daily notification if enabled
    if (notificationsEnabled && permissionState === 'granted') {
      scheduleNotification();
    }
  }, [notificationsEnabled, reminderTime, permissionState]);

  // Request notification permission
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setShowBanner(false);
        // Show immediate confirmation notification
        new Notification('Notifications enabled!', {
          body: 'You will now receive daily reminders to log your mood.',
          icon: '/icons/icon-192x192.png'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Schedule a notification
  const scheduleNotification = () => {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    // Set notification time for today
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (notificationTime < now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }
    
    // If service workers are available, send the scheduling message
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title: 'Time for your daily check-in',
        body: 'How are you feeling today? Take a moment to reflect and log your mood.',
        tag: 'daily-reminder',
        timestamp: notificationTime.getTime()
      });
    } 
    // Fallback to local notification scheduling if service worker isn't ready
    else {
      const delay = notificationTime.getTime() - now.getTime();
      setTimeout(() => {
        new Notification('Time for your daily check-in', {
          body: 'How are you feeling today? Take a moment to reflect and log your mood.',
          icon: '/icons/icon-192x192.png'
        });
      }, delay);
    }
  };

  // Toggle notifications on/off
  const toggleNotifications = () => {
    if (permissionState !== 'granted') {
      requestPermission();
      return;
    }
    
    setNotificationsEnabled(prev => !prev);
  };

  // Save settings to IndexedDB for service worker access
  const saveSettingsToIndexedDB = async (settings) => {
    try {
      const db = await openDatabase();
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      await store.put({
        id: 'userSettings',
        ...settings
      });
      await tx.complete;
    } catch (error) {
      console.error('Error saving settings to IndexedDB:', error);
    }
  };

  // Helper function to open IndexedDB
  const openDatabase = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MindMattersDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create settings object store if it doesn't exist
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
      
      request.onerror = (event) => {
        reject('Database error: ' + event.target.error);
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  };

  // Register for periodic sync if available (Chrome only)
  const registerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
          await registration.periodicSync.register('daily-reminder', {
            minInterval: 24 * 60 * 60 * 1000 // once per day
          });
        }
      } catch (error) {
        console.error('Error registering periodic sync:', error);
      }
    }
  };

  return (
    <div className="notification-manager">
      <h2>Reminder Settings</h2>
      
      {showBanner && permissionState === 'default' && (
        <div className="notification-banner">
          <p>
            <span className="banner-icon">🔔</span> 
            Enable notifications to get daily reminders for journaling
          </p>
          <button onClick={requestPermission} className="enable-btn">Enable</button>
          <button onClick={() => setShowBanner(false)} className="close-btn">×</button>
        </div>
      )}
      
      <div className="notification-settings">
        {permissionState === 'unsupported' ? (
          <p className="notification-warning">Your browser doesn't support notifications.</p>
        ) : (
          <>
            <div className="setting-group">
              <label className="toggle-label">
                Daily Journal Reminder
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={toggleNotifications}
                    disabled={permissionState !== 'granted'}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              
              {permissionState === 'denied' && (
                <p className="notification-warning">
                  Notifications are blocked. Please update your browser settings to enable notifications.
                </p>
              )}
            </div>
            
            {permissionState === 'granted' && (
              <div className="setting-group">
                <label htmlFor="reminderTime">Reminder Time</label>
                <input
                  id="reminderTime"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  disabled={!notificationsEnabled}
                  className="time-picker"
                />
                <p className="setting-hint">
                  We'll send you a reminder to log your journal entry each day at this time.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;