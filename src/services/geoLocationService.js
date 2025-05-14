/**
 * Service to detect user's location using ipapi.co
 */

// Cache the location data
let cachedLocationData = null;
let cacheTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let cacheTimestamp = 0;

/**
 * Get the user's country based on IP address
 * @returns {Promise<Object>} Promise resolving to country info
 */
export const getUserCountry = async () => {
  // Return cached data if it's still valid
  if (cachedLocationData && (Date.now() - cacheTimestamp) < cacheTTL) {
    return cachedLocationData;
  }

  try {
    // Check if we're offline
    if (!navigator.onLine) {
      // Try to get from local storage
      const storedLocation = localStorage.getItem('userCountry');
      if (storedLocation) {
        return JSON.parse(storedLocation);
      }
      throw new Error('Offline and no cached location data');
    }

    // Fetch from ipapi.co
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Geolocation API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Store in cache and localStorage
    cachedLocationData = {
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
      source: 'api'
    };
    
    cacheTimestamp = Date.now();
    localStorage.setItem('userCountry', JSON.stringify(cachedLocationData));
    
    return cachedLocationData;
  } catch (error) {
    console.error('Failed to detect country:', error);
    
    // Return default if we can't get location
    return {
      country: 'United States',
      countryCode: 'US',
      source: 'default'
    };
  }
};