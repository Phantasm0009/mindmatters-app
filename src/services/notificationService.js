/**
 * Service for handling push notifications and reminders
 */

import { openDB } from 'idb';

const DB_NAME = 'MindMattersDB';
const DB_VERSION = 1;
const SETTINGS_STORE = 'settings';

/**
 * Check if notifications are supported and permission is granted
 * @returns {Promise<boolean>} Whether notifications can be used
 */
export const canUseNotifications = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  
  // If permission is already granted
  if (Notification.permission === 'granted') {
    return true;
  }
  
  // If permission is denied, we can't request again
  if (Notification.permission === 'denied') {
    return false;
  }
  
  // Otherwise, we need to request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Request notification permission
 * @returns {Promise<string>} The permission status
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'error';
  }
};

/**
 * Schedule a daily reminder notification
 * @param {number} hour - Hour of day (0-23)
 * @param {number} minute - Minute of hour (0-59)
 */
export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  // Check if we can use notifications
  const canUse = await canUseNotifications();
  if (!canUse) {
    console.warn('Cannot use notifications. Permission denied or not supported.');
    return false;
  }
  
  try {
    // Save reminder settings to IndexedDB
    await saveNotificationSettings({
      enabled: true,
      reminderTime: { hour, minute }
    });
    
    // Create a Date object for today at the specified time
    const now = new Date();
    const reminderTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );
    
    // If the time has already passed today, set it for tomorrow
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    // Schedule with service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title: 'MindMatters Daily Check-in',
        body: 'How are you feeling today? Take a moment to log your mood.',
        tag: 'daily-reminder',
        timestamp: reminderTime.getTime()
      });
      
      return true;
    } else {
      // Fallback to setTimeout if service worker is not available
      // Note: This won't work if the app is closed
      const delay = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        new Notification('MindMatters Daily Check-in', {
          body: 'How are you feeling today? Take a moment to log your mood.',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-96x96.png',
        });
      }, delay);
      
      return true;
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

/**
 * Cancel scheduled daily reminders
 */
export const cancelDailyReminder = async () => {
  try {
    // Save the disabled state to IndexedDB
    await saveNotificationSettings({
      enabled: false
    });
    
    // Notify service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CANCEL_NOTIFICATIONS',
        tag: 'daily-reminder'
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error cancelling reminders:', error);
    return false;
  }
};

/**
 * Check if a reminder is currently scheduled
 * @returns {Promise<boolean>} Whether a reminder is active
 */
export const isReminderActive = async () => {
  try {
    const settings = await getNotificationSettings();
    return settings && settings.enabled;
  } catch (error) {
    console.error('Error checking reminder state:', error);
    return false;
  }
};

/**
 * Get the current reminder time
 * @returns {Promise<Object|null>} The reminder time { hour, minute } or null
 */
export const getReminderTime = async () => {
  try {
    const settings = await getNotificationSettings();
    return settings && settings.reminderTime ? 
      settings.reminderTime : 
      { hour: 20, minute: 0 }; // Default: 8:00 PM
  } catch (error) {
    console.error('Error getting reminder time:', error);
    return { hour: 20, minute: 0 };
  }
};

// Helper functions for working with IndexedDB

/**
 * Save notification settings to IndexedDB
 * @param {Object} settings - Notification settings
 */
const saveNotificationSettings = async (settings) => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
      }
    }
  });
  
  await db.put(SETTINGS_STORE, {
    id: 'notificationSettings',
    value: settings
  });
};

/**
 * Get notification settings from IndexedDB
 * @returns {Promise<Object|null>} The notification settings or null
 */
const getNotificationSettings = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION);
    const settings = await db.get(SETTINGS_STORE, 'notificationSettings');
    return settings ? settings.value : null;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
};

/**
 * Register for background periodic sync (Chrome only)
 */
export const registerPeriodicSync = async () => {
  if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
    try {
      // Get the service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Check if periodic sync is available
      if ('periodicSync' in registration) {
        // Request permission
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync',
        });
        
        if (status.state === 'granted') {
          // Register for daily sync
          await registration.periodicSync.register('daily-reminder', {
            minInterval: 24 * 60 * 60 * 1000, // Once per day
          });
          
          return true;
        }
      }
    } catch (error) {
      console.error('Error registering for periodic sync:', error);
    }
  }
  
  return false;
};

/**
 * Send a test notification
 */
export const sendTestNotification = async () => {
  const canUse = await canUseNotifications();
  
  if (!canUse) {
    console.warn('Cannot send test notification. Permission denied or not supported.');
    return false;
  }
  
  try {
    new Notification('MindMatters Test Notification', {
      body: 'This is a test notification from MindMatters app.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
    });
    
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};