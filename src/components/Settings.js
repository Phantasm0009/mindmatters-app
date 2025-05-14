import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, scheduleDailyReminder, cancelDailyReminder, isReminderActive, getReminderTime, sendTestNotification } from '../services/notificationService';
import './Settings.css';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('notifications');
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState('20:00');
    const [isInstalledPWA, setIsInstalledPWA] = useState(false);
    const [appVersion, setAppVersion] = useState('1.0.0');
    const [offlineStatus, setOfflineStatus] = useState(navigator.onLine ? 'online' : 'offline');
    const [testNotificationSent, setTestNotificationSent] = useState(false);
    const [storageUsage, setStorageUsage] = useState(null);

    // Check notification permission and reminder status on mount
    useEffect(() => {
        const checkNotificationState = async () => {
            setNotificationPermission(Notification.permission);
            
            const reminderActive = await isReminderActive();
            setReminderEnabled(reminderActive);
            
            const time = await getReminderTime();
            if (time) {
                setReminderTime(
                    `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
                );
            }
        };
        
        if ('Notification' in window) {
            checkNotificationState();
        }
    }, []);
    
    // Check if app is installed as PWA
    useEffect(() => {
        const checkPWAStatus = () => {
            // Check if app is in standalone mode or display-mode is standalone
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                                window.navigator.standalone || 
                                document.referrer.includes('android-app://');
                                
            setIsInstalledPWA(isStandalone);
        };
        
        checkPWAStatus();
    }, []);
    
    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setOfflineStatus('online');
        const handleOffline = () => setOfflineStatus('offline');
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    // Calculate storage usage
    useEffect(() => {
        const calculateStorageUsage = async () => {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                try {
                    const estimate = await navigator.storage.estimate();
                    const usedMB = Math.round(estimate.usage / (1024 * 1024) * 10) / 10;
                    const quotaMB = Math.round(estimate.quota / (1024 * 1024) * 10) / 10;
                    const percentUsed = Math.round((estimate.usage / estimate.quota) * 100);
                    
                    setStorageUsage({
                        used: usedMB,
                        quota: quotaMB,
                        percent: percentUsed
                    });
                } catch (error) {
                    console.error('Error calculating storage usage:', error);
                }
            }
        };
        
        calculateStorageUsage();
    }, []);

    // Request notification permission
    const handleRequestPermission = async () => {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
    };

    // Toggle daily reminder
    const handleToggleReminder = async () => {
        try {
            if (reminderEnabled) {
                await cancelDailyReminder();
                setReminderEnabled(false);
            } else {
                const [hour, minute] = reminderTime.split(':').map(Number);
                const success = await scheduleDailyReminder(hour, minute);
                setReminderEnabled(success);
            }
        } catch (error) {
            console.error('Error toggling reminder:', error);
        }
    };

    // Update reminder time
    const handleTimeChange = async (e) => {
        const newTime = e.target.value;
        setReminderTime(newTime);
        
        if (reminderEnabled) {
            const [hour, minute] = newTime.split(':').map(Number);
            await scheduleDailyReminder(hour, minute);
        }
    };
    
    // Send test notification
    const handleTestNotification = async () => {
        const success = await sendTestNotification();
        setTestNotificationSent(success);
        
        if (success) {
            setTimeout(() => setTestNotificationSent(false), 3000);
        }
    };
    
    // Handle app installation
    const handleInstallClick = () => {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    setIsInstalledPWA(true);
                } else {
                    console.log('User dismissed the install prompt');
                }
                window.deferredPrompt = null;
            });
        }
    };
    
    // Clear app data
    const handleClearData = async () => {
        if (window.confirm('Are you sure? This will delete all your journal entries and settings.')) {
            try {
                // Clear IndexedDB
                const databases = await window.indexedDB.databases();
                databases.forEach(db => {
                    window.indexedDB.deleteDatabase(db.name);
                });
                
                // Clear localStorage
                localStorage.clear();
                
                // Clear caches
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                }
                
                // Reload the app
                window.location.reload();
            } catch (error) {
                console.error('Error clearing app data:', error);
            }
        }
    };

    return (
        <div className="settings">
            <h2>
                <span className="settings-icon">⚙️</span>
                Settings
            </h2>
            
            <div className="settings-container">
                <div className="settings-sidebar">
                    <button 
                        className={`settings-nav-btn ${activeSection === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveSection('notifications')}
                    >
                        <span className="settings-nav-icon">🔔</span>
                        Notifications
                    </button>
                    <button 
                        className={`settings-nav-btn ${activeSection === 'app' ? 'active' : ''}`}
                        onClick={() => setActiveSection('app')}
                    >
                        <span className="settings-nav-icon">📱</span>
                        App Installation
                    </button>
                    <button 
                        className={`settings-nav-btn ${activeSection === 'data' ? 'active' : ''}`}
                        onClick={() => setActiveSection('data')}
                    >
                        <span className="settings-nav-icon">💾</span>
                        Data Management
                    </button>
                    <button 
                        className={`settings-nav-btn ${activeSection === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveSection('about')}
                    >
                        <span className="settings-nav-icon">ℹ️</span>
                        About
                    </button>
                </div>
                
                <div className="settings-content">
                    {activeSection === 'notifications' && (
                        <div className="settings-section">
                            <h3>Notification Settings</h3>
                            <p>Configure reminders to help you maintain a consistent journaling habit.</p>
                            
                            <div className="settings-subsection">
                                <h4>Push Notifications</h4>
                                {!('Notification' in window) ? (
                                    <p className="settings-warning">
                                        Your browser doesn't support push notifications.
                                    </p>
                                ) : notificationPermission === 'denied' ? (
                                    <p className="settings-warning">
                                        Notification permission was denied. Please update your browser settings to enable notifications.
                                    </p>
                                ) : notificationPermission !== 'granted' ? (
                                    <div>
                                        <p>Allow MindMatters to send you helpful reminders.</p>
                                        <button 
                                            onClick={handleRequestPermission} 
                                            className="settings-btn"
                                        >
                                            Enable Notifications
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Notification permission granted. You can now receive reminders.</p>
                                        <button 
                                            onClick={handleTestNotification} 
                                            className="settings-btn"
                                            disabled={testNotificationSent}
                                        >
                                            {testNotificationSent ? 'Notification Sent!' : 'Send Test Notification'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="settings-subsection">
                                <h4>Daily Journal Reminder</h4>
                                <div className="toggle-setting">
                                    <label className="toggle-label">
                                        Enable daily reminder
                                        <div className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={reminderEnabled}
                                                onChange={handleToggleReminder}
                                                disabled={notificationPermission !== 'granted'}
                                            />
                                            <span className="toggle-slider"></span>
                                        </div>
                                    </label>
                                </div>
                                
                                <div className="time-setting">
                                    <label htmlFor="reminderTime">Reminder Time:</label>
                                    <input
                                        type="time"
                                        id="reminderTime"
                                        value={reminderTime}
                                        onChange={handleTimeChange}
                                        disabled={!reminderEnabled || notificationPermission !== 'granted'}
                                    />
                                    <p className="time-note">We'll send you a reminder to journal at this time each day.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeSection === 'app' && (
                        <div className="settings-section">
                            <h3>App Installation</h3>
                            <p>Install MindMatters on your device for a better experience and offline access.</p>
                            
                            <div className="settings-subsection">
                                <h4>Install as App</h4>
                                {isInstalledPWA ? (
                                    <p>MindMatters is already installed on your device.</p>
                                ) : (
                                    <>
                                        <p>
                                            Install MindMatters on your home screen for quick access and a full-screen experience,
                                            even when offline.
                                        </p>
                                        <button 
                                            onClick={handleInstallClick} 
                                            className="install-button"
                                            disabled={!window.deferredPrompt}
                                        >
                                            Install MindMatters
                                        </button>
                                        {!window.deferredPrompt && (
                                            <div className="install-note">
                                                <p>
                                                    To install manually:
                                                    {navigator.userAgent.includes('Chrome') && (
                                                        <span> Click the menu (⋮) then "Install App"</span>
                                                    )}
                                                    {navigator.userAgent.includes('Firefox') && (
                                                        <span> Click the menu (≡) then "Install app"</span>
                                                    )}
                                                    {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && (
                                                        <span> Click the share button then "Add to Home Screen"</span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            
                            <div className="settings-subsection">
                                <h4>Offline Capability</h4>
                                <div className="status-items">
                                    <div className="status-item">
                                        <span className="status-label">Current Status:</span>
                                        <span className={`status-value ${offlineStatus}`}>
                                            {offlineStatus === 'online' ? 'Connected' : 'Offline'}
                                        </span>
                                    </div>
                                    <p className="status-info">
                                        MindMatters works even when you're offline. Your data will be stored locally
                                        and synced when you reconnect.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeSection === 'data' && (
                        <div className="settings-section">
                            <h3>Data Management</h3>
                            <p>Manage your journal data and app storage.</p>
                            
                            <div className="settings-subsection">
                                <h4>Storage Usage</h4>
                                {storageUsage ? (
                                    <div className="storage-usage">
                                        <div className="usage-bar-container">
                                            <div 
                                                className="usage-bar" 
                                                style={{ width: `${storageUsage.percent}%` }}
                                            ></div>
                                        </div>
                                        <p className="usage-text">
                                            Using {storageUsage.used} MB of {storageUsage.quota} MB ({storageUsage.percent}%)
                                        </p>
                                    </div>
                                ) : (
                                    <p>Storage information not available in this browser.</p>
                                )}
                            </div>
                            
                            <div className="settings-subsection">
                                <h4>Data Actions</h4>
                                <div className="data-actions">
                                    {/* This section could include import/export features in the future */}
                                    <button 
                                        onClick={handleClearData} 
                                        className="danger-button"
                                    >
                                        Clear All App Data
                                    </button>
                                    <p className="warning-text">
                                        This will delete all your journal entries, mood tracking data, and app settings.
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeSection === 'about' && (
                        <div className="settings-section">
                            <h3>About MindMatters</h3>
                            
                            <div className="settings-subsection">
                                <div className="app-info">
                                    <img 
                                        src="/icons/icon-192x192.png" 
                                        alt="MindMatters Logo" 
                                        className="app-logo" 
                                    />
                                    <div>
                                        <h4>MindMatters</h4>
                                        <p>Version {appVersion}</p>
                                    </div>
                                </div>
                                <p className="app-description">
                                    MindMatters is an offline-first mental health journal designed to help you track
                                    your mood, thoughts, and emotions.
                                </p>
                            </div>
                            
                            <div className="settings-subsection">
                                <h4>App Status</h4>
                                <div className="status-items">
                                    <div className="status-item">
                                        <span className="status-label">Service Worker:</span>
                                        <span className="status-value">
                                            {'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}
                                        </span>
                                    </div>
                                    <div className="status-item">
                                        <span className="status-label">Installed as PWA:</span>
                                        <span className="status-value">
                                            {isInstalledPWA ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="status-item">
                                        <span className="status-label">Notifications:</span>
                                        <span className="status-value">
                                            {'Notification' in window ? 
                                                (notificationPermission === 'granted' ? 'Enabled' : 'Disabled') :
                                                'Not Supported'
                                            }
                                        </span>
                                    </div>
                                    <div className="status-item">
                                        <span className="status-label">Connection:</span>
                                        <span className={`status-value ${offlineStatus}`}>
                                            {offlineStatus === 'online' ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="credits">
                                <p>© 2025 MindMatters - Created with ❤️ for mental wellbeing</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;