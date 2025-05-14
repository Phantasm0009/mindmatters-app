/**
 * Weather service to interact with Open-Meteo API
 */

// Default coordinates if geolocation is not available
const DEFAULT_LAT = 40.7128;  // New York
const DEFAULT_LONG = -74.0060;

/**
 * Get the user's current location
 * @returns {Promise} Promise resolving to {latitude, longitude}
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location');
      resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LONG });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error.message);
        resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LONG });
      },
      { timeout: 10000 }
    );
  });
};

/**
 * Fetch current weather data from Open-Meteo API
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise} Weather data
 */
export const fetchCurrentWeather = async (latitude, longitude) => {
  try {
    // If offline, return cached weather if available
    if (!navigator.onLine) {
      const cachedWeather = localStorage.getItem('cachedWeather');
      if (cachedWeather) {
        const { data, timestamp } = JSON.parse(cachedWeather);
        // Return cached data if less than 3 hours old
        if (Date.now() - timestamp < 3 * 60 * 60 * 1000) {
          return { ...data, source: 'cache' };
        }
      }
      throw new Error('Offline and no recent cached weather');
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=1`;

    const response = await fetch(url, { 
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the weather data
    const weatherCache = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem('cachedWeather', JSON.stringify(weatherCache));
    
    return { ...data, source: 'api' };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    
    // Return cached data if available, regardless of age
    const cachedWeather = localStorage.getItem('cachedWeather');
    if (cachedWeather) {
      const { data } = JSON.parse(cachedWeather);
      return { ...data, source: 'old-cache' };
    }
    
    throw error;
  }
};

/**
 * Get weather description from weather code
 * @param {number} code - WMO weather code
 * @returns {string} Weather description
 */
export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
};

/**
 * Get weather icon based on weather code and day/night
 * @param {number} code - WMO weather code
 * @param {boolean} isDay - Whether it's daytime
 * @returns {string} Weather icon (emoji)
 */
export const getWeatherIcon = (code, isDay = true) => {
  // Map weather codes to emojis
  if (code === 0) return isDay ? '☀️' : '🌙'; // Clear
  if (code === 1) return isDay ? '🌤️' : '🌙'; // Mainly clear
  if (code === 2) return isDay ? '⛅' : '☁️'; // Partly cloudy
  if (code === 3) return '☁️'; // Overcast
  if (code >= 45 && code <= 48) return '🌫️'; // Fog
  if (code >= 51 && code <= 57) return '🌦️'; // Drizzle
  if (code >= 61 && code <= 67) return '🌧️'; // Rain
  if (code >= 71 && code <= 77) return '❄️'; // Snow
  if (code >= 80 && code <= 82) return '🌧️'; // Rain showers
  if (code >= 85 && code <= 86) return '🌨️'; // Snow showers
  if (code >= 95) return '⛈️'; // Thunderstorm
  
  return isDay ? '☀️' : '🌙'; // Default
};

/**
 * Analyze historical weather and mood data to find patterns
 * @param {Array} moodEntries - User's mood entries
 * @param {Array} weatherData - Historical weather data
 * @returns {Object} Analysis of weather-mood relationships
 */
export const analyzeWeatherMoodPatterns = (moodEntries, weatherData) => {
  // If we don't have enough data, return null
  if (!moodEntries || moodEntries.length < 3) {
    return {
      hasEnoughData: false,
      message: "We need more mood entries to analyze weather patterns. Keep logging your moods!"
    };
  }

  // Group mood entries by weather conditions
  const weatherMoodGroups = {
    sunny: { entries: [], avgMood: 0 },
    cloudy: { entries: [], avgMood: 0 },
    rainy: { entries: [], avgMood: 0 },
    snowy: { entries: [], avgMood: 0 }
  };
  
  // Process entries to group by weather
  moodEntries.forEach(entry => {
    if (!entry.weather) return;
    
    const weatherCode = entry.weather.weatherCode;
    
    if (weatherCode === 0 || weatherCode === 1) {
      weatherMoodGroups.sunny.entries.push(entry);
    } else if (weatherCode === 2 || weatherCode === 3) {
      weatherMoodGroups.cloudy.entries.push(entry);
    } else if ((weatherCode >= 51 && weatherCode <= 67) || 
              (weatherCode >= 80 && weatherCode <= 82)) {
      weatherMoodGroups.rainy.entries.push(entry);
    } else if ((weatherCode >= 71 && weatherCode <= 77) || 
              (weatherCode >= 85 && weatherCode <= 86)) {
      weatherMoodGroups.snowy.entries.push(entry);
    }
  });
  
  // Calculate averages for each weather type
  Object.keys(weatherMoodGroups).forEach(weatherType => {
    const group = weatherMoodGroups[weatherType];
    if (group.entries.length > 0) {
      const sum = group.entries.reduce((acc, entry) => acc + entry.moodValue, 0);
      group.avgMood = parseFloat((sum / group.entries.length).toFixed(1));
      group.count = group.entries.length;
    }
  });

  // Generate insights
  const insights = [];
  
  // Find best weather for mood
  let bestWeather = null;
  let highestMood = 0;
  
  // Find worst weather for mood
  let worstWeather = null;
  let lowestMood = 11;
  
  Object.keys(weatherMoodGroups).forEach(weatherType => {
    const group = weatherMoodGroups[weatherType];
    if (group.entries.length >= 2) { // Only if we have enough data
      if (group.avgMood > highestMood) {
        highestMood = group.avgMood;
        bestWeather = weatherType;
      }
      
      if (group.avgMood < lowestMood) {
        lowestMood = group.avgMood;
        worstWeather = weatherType;
      }
    }
  });
  
  if (bestWeather) {
    insights.push({
      type: 'positive',
      text: `You tend to feel better on ${bestWeather} days (average mood: ${highestMood}/10).`
    });
  }
  
  if (worstWeather && worstWeather !== bestWeather) {
    insights.push({
      type: 'negative',
      text: `You tend to feel lower on ${worstWeather} days (average mood: ${lowestMood}/10).`
    });
  }
  
  // Check for substantial differences
  if (bestWeather && worstWeather && bestWeather !== worstWeather) {
    const difference = highestMood - lowestMood;
    if (difference >= 2) {
      insights.push({
        type: 'significant',
        text: `Weather seems to have a significant impact on your mood (${difference.toFixed(1)} points difference).`
      });
    }
  }
  
  return {
    hasEnoughData: true,
    weatherMoodGroups,
    insights,
    bestWeather,
    worstWeather
  };
};