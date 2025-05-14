import React, { useState, useEffect } from 'react';
import { saveJournalEntry } from '../services/storageService';
import { getUserLocation, fetchCurrentWeather } from '../services/weatherService';
import './JournalEntry.css';
import { useTheme } from './ThemeManager';

const JournalEntry = () => {
    const [entry, setEntry] = useState({
        mood: '',
        moodValue: 5,
        thoughts: '',
        activities: [],
        gratitude: '',
        weather: null
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [weatherError, setWeatherError] = useState(null);
    
    // Add the theme context
    const { generateThemeFromMood, currentTheme } = useTheme();

    // Fetch weather data when component mounts
    useEffect(() => {
        let isMounted = true;

        const getWeatherData = async () => {
            setLoadingWeather(true);
            try {
                const location = await getUserLocation();
                const weatherData = await fetchCurrentWeather(location.latitude, location.longitude);
                
                if (isMounted) {
                    if (weatherData && weatherData.current) {
                        setEntry(prev => ({
                            ...prev,
                            weather: {
                                temperature: weatherData.current.temperature_2m,
                                weatherCode: weatherData.current.weather_code,
                                humidity: weatherData.current.relative_humidity_2m,
                                isDay: weatherData.current.is_day === 1
                            }
                        }));
                    }
                    setLoadingWeather(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Failed to load weather:', error);
                    setWeatherError("Couldn't fetch weather data");
                    setLoadingWeather(false);
                }
            }
        };
        
        getWeatherData();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEntry({
            ...entry,
            [name]: value
        });
    };

    // Update the handleMoodSlider function in the JournalEntry component
    const handleMoodSlider = (e) => {
        const newMoodValue = parseInt(e.target.value);
        setEntry({
            ...entry,
            moodValue: newMoodValue
        });
        
        // Always update theme when mood slider changes for immediate visual feedback
        generateThemeFromMood(newMoodValue);
        
        // Also add mood text based on value
        const moodTexts = {
            1: 'Very sad',
            2: 'Sad',
            3: 'Anxious',
            4: 'Stressed',
            5: 'Neutral',
            6: 'Content',
            7: 'Calm',
            8: 'Happy',
            9: 'Very happy',
            10: 'Excited'
        };
        
        // Auto-suggest mood text but don't overwrite if user has entered their own
        if (!entry.mood || entry.mood === getMoodLabel(entry.moodValue - 1)) {
            setEntry(prev => ({
                ...prev,
                mood: moodTexts[newMoodValue] || ''
            }));
        }
    };

    const handleActivityToggle = (activity) => {
        const updatedActivities = [...entry.activities];
        
        if (updatedActivities.includes(activity)) {
            const index = updatedActivities.indexOf(activity);
            updatedActivities.splice(index, 1);
        } else {
            updatedActivities.push(activity);
        }
        
        setEntry({
            ...entry,
            activities: updatedActivities
        });
    };

    const getMoodEmoji = (value) => {
        const emojis = ['😞', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '😍'];
        return emojis[value - 1] || '😐';
    };

    const getMoodLabel = (value) => {
        const labels = [
            'Very sad', 'Sad', 'Down', 'Neutral', 'Okay', 
            'Good', 'Happy', 'Very happy', 'Excellent', 'Amazing'
        ];
        return labels[value - 1] || 'Neutral';
    };

    const getWeatherIcon = (weatherCode, isDay) => {
        if (weatherCode === 0) return isDay ? '☀️' : '🌙';
        if (weatherCode === 1) return isDay ? '🌤️' : '🌙';
        if (weatherCode === 2) return isDay ? '⛅' : '☁️';
        if (weatherCode === 3) return '☁️';
        if (weatherCode >= 45 && weatherCode <= 48) return '🌫️';
        if (weatherCode >= 51 && weatherCode <= 57) return '🌦️';
        if (weatherCode >= 61 && weatherCode <= 67) return '🌧️';
        if (weatherCode >= 71 && weatherCode <= 77) return '❄️';
        if (weatherCode >= 80 && weatherCode <= 82) return '🌧️';
        if (weatherCode >= 85 && weatherCode <= 86) return '🌨️';
        if (weatherCode >= 95) return '⛈️';
        
        return isDay ? '☀️' : '🌙';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newEntry = {
            ...entry,
            date: new Date().toISOString()
        };
        
        try {
            await saveJournalEntry(newEntry);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            
            setEntry({
                mood: '',
                moodValue: 5,
                thoughts: '',
                activities: [],
                gratitude: '',
                weather: entry.weather
            });
        } catch (error) {
            console.error('Failed to save entry:', error);
        }
    };

    const activities = [
        'Exercise', 'Reading', 'Meditation', 'Family time', 
        'Friends', 'Work', 'Hobby', 'Nature'
    ];

    return (
        <div className="journal-entry">
            <h2>Daily Journal Entry</h2>
            
            {/* Add a theme indicator */}
            <div className="theme-status">
                <small>UI color theme will update based on your mood</small>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="weather-info">
                    {loadingWeather ? (
                        <div className="weather-loading-mini">Loading weather...</div>
                    ) : weatherError ? (
                        <div className="weather-error-mini">{weatherError}</div>
                    ) : entry.weather ? (
                        <div className="current-weather-mini">
                            <span className="weather-icon-mini">
                                {getWeatherIcon(entry.weather.weatherCode, entry.weather.isDay)}
                            </span>
                            <span className="weather-temp-mini">
                                {Math.round(entry.weather.temperature)}°C
                            </span>
                            <span className="weather-note">
                                Weather is being recorded with your entry
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="mood-selector">
                    <h3>How are you feeling today?</h3>
                    
                    <div className="mood-slider-container">
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={entry.moodValue} 
                            onChange={handleMoodSlider}
                            className="mood-slider"
                        />
                        <div className="mood-emoji">{getMoodEmoji(entry.moodValue)}</div>
                        <div className="mood-label">{getMoodLabel(entry.moodValue)}</div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="mood">In one word, describe your mood:</label>
                    <input
                        type="text"
                        id="mood"
                        name="mood"
                        value={entry.mood}
                        onChange={handleInputChange}
                        placeholder="e.g. Peaceful, Anxious, Excited..."
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="thoughts">What's on your mind today?</label>
                    <textarea
                        id="thoughts"
                        name="thoughts"
                        value={entry.thoughts}
                        onChange={handleInputChange}
                        placeholder="Share your thoughts, feelings, or experiences..."
                        rows="5"
                    />
                </div>

                <div className="form-group">
                    <label>Activities today: (select all that apply)</label>
                    <div className="activity-tags">
                        {activities.map(activity => (
                            <div 
                                key={activity}
                                className={`activity-tag ${entry.activities.includes(activity) ? 'selected' : ''}`}
                                onClick={() => handleActivityToggle(activity)}
                            >
                                {activity}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="gratitude">What are you grateful for today?</label>
                    <textarea
                        id="gratitude"
                        name="gratitude"
                        value={entry.gratitude}
                        onChange={handleInputChange}
                        placeholder="List one or more things you appreciate today..."
                        rows="3"
                    />
                </div>

                <button type="submit" className="submit-button">
                    Save Entry
                </button>
                
                {showSuccess && (
                    <div className="success-message">
                        <span>✅ Journal entry saved successfully!</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default JournalEntry;