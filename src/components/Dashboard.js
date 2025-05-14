import React, { useState, useEffect } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import JournalEntry from './JournalEntry';
import JournalLog from './JournalLog';
import MoodTracker from './MoodTracker';
import BreathingExercises from './BreathingExercises';
import EmergencyContacts from './EmergencyContacts';
import SOSButton from './SOSButton';
import DailyQuote from './DailyQuote';
import WeatherMood from './WeatherMood';
import CrisisHotlines from './CrisisHotlines';
import Settings from './Settings';
import { useTheme } from './ThemeManager';
import './Dashboard.css';

const Dashboard = ({ defaultTab }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || 'journal');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const history = useHistory();
    const location = useLocation();
    const { currentMood } = useTheme();
    
    // Update active tab when route changes
    useEffect(() => {
        const path = location.pathname;
        if (path === '/journal') setActiveTab('journal');
        else if (path === '/history') setActiveTab('history');
        else if (path === '/mood-tracker') setActiveTab('mood');
        else if (path === '/breathing') setActiveTab('breathing');
        else if (path === '/weather-mood') setActiveTab('weather');
        else if (path === '/daily-quote') setActiveTab('quote');
        else if (path === '/crisis-hotlines') setActiveTab('hotlines');
        else if (path === '/emergency-contacts') setActiveTab('contacts');
        else if (path === '/settings') setActiveTab('settings');
    }, [location]);
    
    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    // Get mood class for conditional styling
    const getMoodClass = () => {
        return currentMood ? `mood-${currentMood}` : '';
    };

    // Toggle mobile navigation
    const toggleMobileNav = () => {
        setMobileNavOpen(!mobileNavOpen);
    };
    
    // Navigation items with icons and categories
    const navItems = [
        {
            category: "Journal",
            items: [
                { id: 'journal', path: '/journal', label: 'New Entry', icon: '📝' },
                { id: 'history', path: '/history', label: 'Journal History', icon: '📚' }
            ]
        },
        {
            category: "Mood",
            items: [
                { id: 'mood', path: '/mood-tracker', label: 'Mood Tracker', icon: '📊' },
                { id: 'weather', path: '/weather-mood', label: 'Weather & Mood', icon: '🌤️' }
            ]
        },
        {
            category: "Wellness",
            items: [
                { id: 'breathing', path: '/breathing', label: 'Breathing', icon: '🧘' },
                { id: 'quote', path: '/daily-quote', label: 'Daily Quote', icon: '💭' }
            ]
        },
        {
            category: "Emergency",
            items: [
                { id: 'hotlines', path: '/crisis-hotlines', label: 'Crisis Hotlines', icon: '🆘' },
                { id: 'contacts', path: '/emergency-contacts', label: 'Emergency Contacts', icon: '👥' }
            ]
        }
    ];
    
    return (
        <div className={`dashboard ${getMoodClass()}`}>
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>MindMatters</h1>
                    <p>Your personal mental wellness companion</p>
                </div>
                
                <button 
                    className="mobile-nav-toggle"
                    onClick={toggleMobileNav}
                    aria-label="Toggle navigation menu"
                >
                    <span className={`hamburger ${mobileNavOpen ? 'active' : ''}`}></span>
                </button>
                
                <div className="header-actions">
                    {!isOnline && (
                        <div className="offline-indicator" title="App is in offline mode">
                            Offline
                        </div>
                    )}
                    
                    <Link 
                        to="/settings"
                        className={`settings-link ${activeTab === 'settings' ? 'active' : ''}`}
                        aria-label="Settings"
                    >
                        <span className="settings-icon">⚙️</span>
                    </Link>
                    
                    <SOSButton className="header-sos" />
                </div>
            </header>
            
            <div className={`nav-container ${mobileNavOpen ? 'mobile-open' : ''}`}>
                <nav className="dashboard-nav">
                    {navItems.map(category => (
                        <div key={category.category} className="nav-category">
                            <h3 className="category-heading">{category.category}</h3>
                            <div className="nav-items">
                                {category.items.map(item => (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => setMobileNavOpen(false)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
            
            <main className="dashboard-content">
                {activeTab === 'journal' && <JournalEntry />}
                {activeTab === 'history' && <JournalLog />}
                {activeTab === 'mood' && <MoodTracker />}
                {activeTab === 'breathing' && <BreathingExercises />}
                {activeTab === 'weather' && <WeatherMood />}
                {activeTab === 'quote' && <DailyQuote />}
                {activeTab === 'hotlines' && <CrisisHotlines />}
                {activeTab === 'contacts' && <EmergencyContacts />}
                {activeTab === 'settings' && <Settings />}
                
                {/* Show the quote on the journal page as well for daily inspiration */}
                {activeTab === 'journal' && <DailyQuote />}
            </main>
        </div>
    );
};

export default Dashboard;