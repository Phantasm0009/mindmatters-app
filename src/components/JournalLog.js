import React, { useState, useEffect } from 'react';
import { getMoodEntries } from '../services/storageService';
import './JournalLog.css';

const JournalLog = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, week, month
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const data = await getMoodEntries();
                // Sort by date, newest first
                const sortedData = data.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                setEntries(sortedData);
            } catch (error) {
                console.error("Error fetching journal entries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, []);

    const getFilteredEntries = () => {
        let filteredEntries = [...entries];
        
        // Apply date filter
        if (filter === 'week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            filteredEntries = filteredEntries.filter(entry => 
                new Date(entry.date) >= oneWeekAgo
            );
        } else if (filter === 'month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            filteredEntries = filteredEntries.filter(entry => 
                new Date(entry.date) >= oneMonthAgo
            );
        }
        
        // Apply search filter if search term exists
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filteredEntries = filteredEntries.filter(entry => 
                (entry.thoughts && entry.thoughts.toLowerCase().includes(term)) || 
                (entry.mood && entry.mood.toLowerCase().includes(term)) ||
                (entry.gratitude && entry.gratitude.toLowerCase().includes(term))
            );
        }
        
        return filteredEntries;
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getMoodEmoji = (value) => {
        const emojis = ['😞', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '😍'];
        return emojis[value - 1] || '😐';
    };

    const getWeatherIcon = (weatherCode, isDay) => {
        if (weatherCode === 0) return isDay ? '☀️' : '🌙'; // Clear
        if (weatherCode === 1) return isDay ? '🌤️' : '🌙'; // Mainly clear
        if (weatherCode === 2) return isDay ? '⛅' : '☁️'; // Partly cloudy
        if (weatherCode === 3) return '☁️'; // Overcast
        if (weatherCode >= 45 && weatherCode <= 48) return '🌫️'; // Fog
        if (weatherCode >= 51 && weatherCode <= 57) return '🌦️'; // Drizzle
        if (weatherCode >= 61 && weatherCode <= 67) return '🌧️'; // Rain
        if (weatherCode >= 71 && weatherCode <= 77) return '❄️'; // Snow
        if (weatherCode >= 80 && weatherCode <= 82) return '🌧️'; // Rain showers
        if (weatherCode >= 85 && weatherCode <= 86) return '🌨️'; // Snow showers
        if (weatherCode >= 95) return '⛈️'; // Thunderstorm
        
        return isDay ? '☀️' : '🌙'; // Default
    };

    const getEntryStyle = (moodValue) => {
        // Create a style based on the mood value
        if (!moodValue) return {};
        
        // Generate a color based on mood
        let borderColor;
        let gradientColor;
        
        if (moodValue <= 2) {
            // Sad moods: blue tones
            borderColor = 'var(--sad-color, rgb(108, 117, 187))';
            gradientColor = 'rgba(108, 117, 187, 0.05)';
        } else if (moodValue === 3) {
            // Anxious moods: amber tones
            borderColor = 'var(--anxious-color, rgb(255, 177, 0))';
            gradientColor = 'rgba(255, 177, 0, 0.05)';
        } else if (moodValue === 4) {
            // Stressed moods: orange tones
            borderColor = 'var(--stressed-color, rgb(242, 103, 34))';
            gradientColor = 'rgba(242, 103, 34, 0.05)';
        } else if (moodValue === 5) {
            // Neutral moods: gray tones
            borderColor = 'var(--neutral-color, rgb(190, 190, 190))';
            gradientColor = 'rgba(190, 190, 190, 0.05)';
        } else if (moodValue === 6) {
            // Content moods: lavender tones
            borderColor = 'var(--tired-color, rgb(147, 112, 170))'; 
            gradientColor = 'rgba(147, 112, 170, 0.05)';
        } else if (moodValue === 7) {
            // Calm moods: blue tones
            borderColor = 'var(--calm-color, rgb(86, 161, 200))';
            gradientColor = 'rgba(86, 161, 200, 0.05)';
        } else if (moodValue === 8) {
            // Relaxed moods: green tones
            borderColor = 'var(--relaxed-color, rgb(106, 177, 135))';
            gradientColor = 'rgba(106, 177, 135, 0.05)';
        } else if (moodValue === 9) {
            // Happy moods: yellow tones
            borderColor = 'var(--happy-color, rgb(255, 195, 0))';
            gradientColor = 'rgba(255, 195, 0, 0.05)';
        } else {
            // Excited moods: red-orange tones
            borderColor = 'var(--excited-color, rgb(255, 89, 94))';
            gradientColor = 'rgba(255, 89, 94, 0.05)';
        }
        
        return {
            borderLeft: `4px solid ${borderColor}`,
            background: `linear-gradient(to right, ${gradientColor}, transparent 20%)`
        };
    };

    const handleEntryClick = (entry) => {
        setSelectedEntry(entry);
    };

    const closeEntryDetails = () => {
        setSelectedEntry(null);
    };

    return (
        <div className="journal-log">
            <h2>Your Journal History</h2>
            
            <div className="journal-controls">
                <div className="search-box">
                    <input 
                        type="text"
                        placeholder="Search your entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <button 
                        className={filter === 'all' ? 'active' : ''} 
                        onClick={() => setFilter('all')}>
                        All Time
                    </button>
                    <button 
                        className={filter === 'month' ? 'active' : ''} 
                        onClick={() => setFilter('month')}>
                        Past Month
                    </button>
                    <button 
                        className={filter === 'week' ? 'active' : ''} 
                        onClick={() => setFilter('week')}>
                        Past Week
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your journal entries...</p>
                </div>
            ) : (
                <div className="entries-list">
                    {getFilteredEntries().length > 0 ? (
                        getFilteredEntries().map((entry, index) => (
                            <div 
                                key={index} 
                                className="entry-card"
                                onClick={() => handleEntryClick(entry)}
                                style={getEntryStyle(entry.moodValue)}
                            >
                                <div className="entry-header">
                                    <span className="entry-date">{formatDate(entry.date)}</span>
                                    <span className="entry-mood">
                                        {getMoodEmoji(entry.moodValue)} {entry.mood || `Level ${entry.moodValue}`}
                                    </span>
                                </div>
                                {entry.weather && (
                                    <div className="entry-weather">
                                        <span className="weather-icon">
                                            {getWeatherIcon(entry.weather.weatherCode, entry.weather.isDay)}
                                        </span>
                                        <span className="weather-temp">{Math.round(entry.weather.temperature)}°C</span>
                                    </div>
                                )}
                                <div className="entry-preview">
                                    {entry.thoughts ? (
                                        <p>{entry.thoughts.substring(0, 100)}
                                            {entry.thoughts.length > 100 ? '...' : ''}
                                        </p>
                                    ) : (
                                        <p className="no-content">No thoughts recorded</p>
                                    )}
                                </div>
                                <div className="entry-footer">
                                    {entry.activities && entry.activities.length > 0 && (
                                        <div className="entry-tags">
                                            {entry.activities.slice(0, 3).map((activity, i) => (
                                                <span key={i} className="activity-tag">{activity}</span>
                                            ))}
                                            {entry.activities.length > 3 && <span className="more-tag">+{entry.activities.length - 3}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-entries">
                            <p>No journal entries found</p>
                            {searchTerm && <p>Try changing your search term</p>}
                            {filter !== 'all' && <p>Try changing your date filter</p>}
                        </div>
                    )}
                </div>
            )}

            {selectedEntry && (
                <div className="entry-modal-overlay" onClick={closeEntryDetails}>
                    <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeEntryDetails}>×</button>
                        <div className="entry-modal-date">{formatDate(selectedEntry.date)}</div>
                        
                        <div className="entry-modal-mood">
                            <span className="large-emoji">{getMoodEmoji(selectedEntry.moodValue)}</span>
                            <h3>{selectedEntry.mood || `Mood Level: ${selectedEntry.moodValue}`}</h3>
                        </div>
                        
                        <div className="entry-modal-section">
                            <h4>Thoughts</h4>
                            <p>{selectedEntry.thoughts || "No thoughts recorded"}</p>
                        </div>
                        
                        {selectedEntry.activities && selectedEntry.activities.length > 0 && (
                            <div className="entry-modal-section">
                                <h4>Activities</h4>
                                <div className="activity-tags">
                                    {selectedEntry.activities.map((activity, i) => (
                                        <span key={i} className="activity-tag">{activity}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {selectedEntry.gratitude && (
                            <div className="entry-modal-section">
                                <h4>Gratitude</h4>
                                <p>{selectedEntry.gratitude}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalLog;