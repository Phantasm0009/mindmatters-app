import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getMoodEntries } from '../services/storageService';
import { fetchCurrentWeather, getWeatherIcon, getWeatherDescription, analyzeWeatherMoodPatterns } from '../services/weatherService';
import './WeatherMood.css';

// Register Chart.js components
Chart.register(...registerables);

const WeatherMood = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'radar'

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user's location and weather
        const location = await getUserLocation();
        const weatherData = await fetchCurrentWeather(location.latitude, location.longitude);
        setCurrentWeather(weatherData);
        
        // Get mood entries for analysis
        const entries = await getMoodEntries();
        setMoodEntries(entries);
        
        // Analyze weather effects on mood
        const weatherAnalysis = analyzeWeatherMoodPatterns(entries, weatherData);
        setAnalysis(weatherAnalysis);
      } catch (err) {
        console.error('Failed to load weather or mood data:', err);
        setError('Could not load weather or mood data. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to get user location
  const getUserLocation = () => {
    return new Promise((resolve) => {
      // Default coordinates if geolocation fails
      const defaultLocation = { latitude: 40.7128, longitude: -74.0060 };
      
      if (!navigator.geolocation) {
        resolve(defaultLocation);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(defaultLocation);
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          clearTimeout(timeout);
          resolve(defaultLocation);
        }
      );
    });
  };

  // Prepare chart data for weather-mood correlation
  const getChartData = () => {
    if (!analysis || !analysis.hasEnoughData) return null;
    
    const weatherTypes = Object.keys(analysis.weatherMoodGroups).filter(
      type => analysis.weatherMoodGroups[type].entries.length > 0
    );
    
    // Get custom colors for each weather type
    const getWeatherColors = (weatherType, alpha = 0.7) => {
      const colors = {
        sunny: `rgba(255, 194, 14, ${alpha})`,  // Bright yellow
        cloudy: `rgba(164, 175, 196, ${alpha})`, // Blue-gray
        rainy: `rgba(86, 141, 198, ${alpha})`,   // Blue
        snowy: `rgba(219, 234, 254, ${alpha})`   // Light blue
      };
      
      return colors[weatherType] || `rgba(150, 150, 150, ${alpha})`;
    };
    
    return {
      labels: weatherTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          label: 'Average Mood (1-10)',
          data: weatherTypes.map(type => analysis.weatherMoodGroups[type].avgMood),
          backgroundColor: weatherTypes.map(type => getWeatherColors(type)),
          borderColor: weatherTypes.map(type => getWeatherColors(type, 1)),
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: weatherTypes.map(type => getWeatherColors(type, 0.9)),
        }
      ]
    };
  };
  
  // Chart options
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#555',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return `${context[0].label} Weather`;
            },
            label: function(context) {
              return `Average Mood: ${context.parsed.y.toFixed(1)}/10`;
            },
            afterLabel: function(context) {
              const index = context.dataIndex;
              const weatherType = Object.keys(analysis.weatherMoodGroups)[index];
              const count = analysis.weatherMoodGroups[weatherType].count || 0;
              return `Based on ${count} entries`;
            }
          }
        }
      }
    };
    
    // Specific options for bar chart
    if (chartType === 'bar') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: false,
            min: 1,
            max: 10,
            ticks: {
              stepSize: 1,
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            title: {
              display: true,
              text: 'Mood Level',
              color: '#555',
              font: {
                weight: 'bold'
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#666'
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeOutQuart'
        }
      };
    }
    
    // Specific options for radar chart
    return {
      ...baseOptions,
      scales: {
        r: {
          min: 1,
          max: 10,
          ticks: {
            stepSize: 1,
            color: '#666',
            backdropColor: 'transparent'
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          pointLabels: {
            color: '#333',
            font: {
              size: 12
            }
          }
        }
      }
    };
  };

  // Format current temperature
  const formatTemperature = (temp) => {
    return `${Math.round(temp)}°C`;
  };

  // Calculate time since weather was last fetched
  const getWeatherTimeAgo = () => {
    if (!currentWeather || !currentWeather.timestamp) return '';
    
    const now = Date.now();
    const timestamp = currentWeather.timestamp;
    const diff = now - timestamp;
    
    // Convert to minutes
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    // Convert to days
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="weather-mood">
      <h2>Weather & Mood Insights</h2>
      
      {loading ? (
        <div className="weather-loading">
          <div className="weather-spinner"></div>
          <p>Loading weather data and analyzing your mood patterns...</p>
        </div>
      ) : error ? (
        <div className="weather-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="reload-button">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {currentWeather && currentWeather.current && (
            <div className="current-weather">
              <div className="weather-icon-large">
                {getWeatherIcon(currentWeather.current.weather_code, currentWeather.current.is_day)}
              </div>
              <div className="weather-details">
                <h3>Current Weather</h3>
                <div className="weather-temp">
                  {formatTemperature(currentWeather.current.temperature_2m)}
                </div>
                <div className="weather-desc">
                  {getWeatherDescription(currentWeather.current.weather_code)}
                </div>
                <div className="weather-meta">
                  <span>Feels like {formatTemperature(currentWeather.current.apparent_temperature)}</span>
                  <span>• Humidity: {currentWeather.current.relative_humidity_2m}%</span>
                  <span className="cached-indicator">Updated {getWeatherTimeAgo()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mood-weather-analysis">
            <h3>How Weather Affects Your Mood</h3>
            
            {!analysis || !analysis.hasEnoughData ? (
              <div className="no-data-message">
                <p>{analysis?.message || "Not enough data to analyze weather effects on your mood yet."}</p>
                <p>Keep logging your daily entries to see patterns emerge!</p>
              </div>
            ) : (
              <>
                <div className="chart-type-toggle">
                  <button 
                    className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                    onClick={() => setChartType('bar')}
                  >
                    Bar Chart
                  </button>
                  <button 
                    className={`chart-type-btn ${chartType === 'radar' ? 'active' : ''}`}
                    onClick={() => setChartType('radar')}
                  >
                    Radar Chart
                  </button>
                </div>
              
                <div className="chart-container">
                  {chartType === 'bar' ? (
                    <Bar data={getChartData()} options={getChartOptions()} />
                  ) : (
                    <Chart type="radar" data={getChartData()} options={getChartOptions()} />
                  )}
                </div>
                
                <div className="insights-container">
                  <h4>Insights</h4>
                  <ul className="insights-list">
                    {analysis.insights.map((insight, index) => (
                      <li 
                        key={index} 
                        className={`insight-item insight-${insight.type}`}
                      >
                        {insight.text}
                      </li>
                    ))}
                    
                    {analysis.insights.length === 0 && (
                      <li className="insight-item insight-neutral">
                        Weather doesn't appear to have a strong effect on your mood based on current data.
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
          
          <div className="weather-tips">
            <h4>Weather Wellness Tips</h4>
            {currentWeather && currentWeather.current && (
              <div className="tips-container">
                {currentWeather.current.weather_code <= 1 && (
                  <p>☀️ <strong>Sunny day tip:</strong> Sunshine boosts vitamin D production, which can improve mood. Consider spending 15-20 minutes outside.</p>
                )}
                
                {currentWeather.current.weather_code >= 2 && currentWeather.current.weather_code <= 3 && (
                  <p>☁️ <strong>Cloudy day tip:</strong> Cloudy days can sometimes affect mood. Try brightening your environment with good lighting.</p>
                )}
                
                {currentWeather.current.weather_code >= 51 && currentWeather.current.weather_code <= 67 && (
                  <p>🌧️ <strong>Rainy day tip:</strong> The sound of rain can be calming. Consider mindful listening or using the day for cozy indoor activities.</p>
                )}
                
                {currentWeather.current.weather_code >= 71 && currentWeather.current.weather_code <= 86 && (
                  <p>❄️ <strong>Snowy day tip:</strong> Cold weather can make us less active. Try to maintain physical movement indoors.</p>
                )}
                
                {currentWeather.current.weather_code >= 95 && (
                  <p>⛈️ <strong>Stormy day tip:</strong> Storms can trigger anxiety in some people. Practice deep breathing exercises if you feel anxious.</p>
                )}
                
                <p className="general-tip">
                  Being aware of how weather affects your mood can help you prepare and adapt your self-care routines.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherMood;