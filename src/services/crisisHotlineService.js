import staticHotlines from '../data/crisisHotlines';
import { fetchWikipediaCrisisHotlines, getWikiHotlinesCacheInfo } from './wikiHotlineService';

/**
 * Get combined crisis hotlines from Wikipedia and static data
 * @param {boolean} forceRefresh - Whether to force refresh Wikipedia data
 * @returns {Promise<Array>} Combined hotline data
 */
export const getCombinedHotlines = async (forceRefresh = false) => {
  // Skip trying to fetch from Wikipedia - just use static data
  return { 
    hotlines: staticHotlines,
    source: 'static',
    wikiSuccess: false,
    error: "Using reliable local database only"
  };
};

/**
 * Get the cache status of Wikipedia hotlines
 */
export const getHotlinesCacheStatus = () => {
  return getWikiHotlinesCacheInfo();
};

/**
 * Find hotlines for a specific country code
 * @param {Array} hotlines - Array of hotline data
 * @param {string} countryCode - Two-letter country code
 * @returns {Object|null} Country hotlines or null if not found
 */
export const getHotlinesForCountry = (hotlines, countryCode) => {
  if (!countryCode || !hotlines || !Array.isArray(hotlines)) return null;
  
  // Normalize country code to uppercase
  const normalizedCode = countryCode.toUpperCase();
  
  // Find matching country
  const country = hotlines.find(c => c.countryCode === normalizedCode);
  
  // Return country data or international as fallback
  return country || hotlines.find(c => c.countryCode === "INTL");
};

/**
 * Get all available countries with hotlines
 * @param {Array} hotlines - Array of hotline data
 * @returns {Array} List of countries with their codes
 */
export const getAvailableCountries = (hotlines) => {
  if (!hotlines || !Array.isArray(hotlines)) return [];
  
  return hotlines.map(country => ({
    name: country.country,
    code: country.countryCode
  }));
};

/**
 * Merge Wikipedia and static hotline data
 * @param {Array} wikiHotlines - Hotlines from Wikipedia
 * @param {Array} staticHotlines - Our static hotlines
 * @returns {Array} Merged hotlines
 */
const mergeCrisisHotlines = (wikiHotlines, staticHotlines) => {
  // Start with a copy of wiki hotlines
  const merged = [...wikiHotlines];
  const wikiCountryCodes = wikiHotlines.map(h => h.countryCode);
  
  // Add static hotlines that aren't in Wikipedia data
  for (const hotline of staticHotlines) {
    if (!wikiCountryCodes.includes(hotline.countryCode)) {
      merged.push(hotline);
    }
  }
  
  // Always include international entry if not present
  if (!merged.find(h => h.countryCode === 'INTL')) {
    merged.push(staticHotlines.find(h => h.countryCode === 'INTL'));
  }
  
  // Sort by country name
  return merged.sort((a, b) => a.country.localeCompare(b.country));
};