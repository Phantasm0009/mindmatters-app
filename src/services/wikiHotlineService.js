/**
 * Service to fetch and parse crisis hotline data from Wikipedia
 */

// Cache configuration
const CACHE_KEY = 'wikiHotlinesCache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Fetches crisis hotlines from Wikipedia and caches them
 * @returns {Promise<Array>} Array of country hotline objects
 */
export const fetchWikipediaCrisisHotlines = async (forceRefresh = false) => {
  try {
    // Check if we're offline
    if (!navigator.onLine) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { hotlines, timestamp } = JSON.parse(cachedData);
        console.log('Using cached Wikipedia hotlines (offline)');
        return hotlines;
      }
      throw new Error('Offline and no cached hotlines');
    }

    // Check cache if not forcing refresh
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { hotlines, timestamp } = JSON.parse(cachedData);
        // Use cache if it's not expired
        if (Date.now() - timestamp < CACHE_TTL) {
          console.log('Using cached Wikipedia hotlines');
          return hotlines;
        }
      }
    }

    // Fetch data from Wikipedia
    console.log('Fetching hotlines from Wikipedia...');
    const response = await fetch(
      'https://corsproxy.org/?' + encodeURIComponent('https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines'), 
      {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from Wikipedia: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse the HTML
    const hotlines = parseWikipediaHotlines(html);

    // Cache the results
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      hotlines,
      timestamp: Date.now()
    }));

    return hotlines;
  } catch (error) {
    console.error('Error fetching Wikipedia crisis hotlines:', error);
    throw error;
  }
};

/**
 * Parse Wikipedia HTML to extract crisis hotline data
 * @param {string} html - HTML content of the Wikipedia page
 * @returns {Array} Array of parsed hotline data
 */
const parseWikipediaHotlines = (html) => {
  // Create a temporary DOM element to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find the main table with the hotlines
  const table = doc.querySelector('.wikitable');
  if (!table) {
    throw new Error('Could not find hotlines table on Wikipedia page');
  }
  
  // Extract table rows (skip the header row)
  const rows = Array.from(table.querySelectorAll('tr')).slice(1);
  
  // Parse each row into a country hotline object
  const hotlinesData = rows.map(row => {
    const columns = row.querySelectorAll('td');
    
    // Some rows might be layout elements, skip if not enough columns
    if (columns.length < 2) return null;
    
    // Extract the country name
    const countryColumn = columns[0];
    const country = countryColumn.textContent.trim();
    
    // Try to find country code (this is a simplification)
    const countryCode = getCountryCode(country);
    
    // Extract hotlines (organizations and numbers)
    const hotlines = [];
    for (let i = 1; i < columns.length; i += 2) {
      const orgColumn = columns[i];
      const numberColumn = columns[i+1];
      
      if (!orgColumn || !numberColumn) continue;
      
      const orgLinks = orgColumn.querySelectorAll('a');
      let name = orgColumn.textContent.trim();
      let website = null;
      
      // Try to extract website URL if available
      if (orgLinks && orgLinks.length > 0) {
        const href = orgLinks[0].getAttribute('href');
        if (href && href.startsWith('http')) {
          website = href;
        } else if (href && href.startsWith('/wiki/')) {
          website = `https://en.wikipedia.org${href}`;
        }
      }
      
      // Extract phone number(s)
      const phoneText = numberColumn ? numberColumn.textContent.trim() : '';
      const phones = phoneText
        .split(/[,;\n]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      if (phones.length > 0) {
        hotlines.push({
          name,
          phone: phones[0],
          altPhone: phones.length > 1 ? phones[1] : null,
          description: `Crisis support service in ${country}`,
          website
        });
      }
    }
    
    if (hotlines.length === 0) return null;
    
    return {
      country,
      countryCode,
      hotlines
    };
  }).filter(Boolean); // Remove nulls
  
  return hotlinesData;
};

/**
 * Simple mapping of country names to country codes
 * @param {string} countryName 
 * @returns {string} Two-letter country code
 */
const getCountryCode = (countryName) => {
  const countryMap = {
    'Argentina': 'AR',
    'Australia': 'AU',
    'Austria': 'AT',
    'Belgium': 'BE',
    'Brazil': 'BR',
    'Bulgaria': 'BG',
    'Canada': 'CA',
    'China': 'CN',
    'Croatia': 'HR',
    'Cyprus': 'CY',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Estonia': 'EE',
    'Finland': 'FI',
    'France': 'FR',
    'Germany': 'DE',
    'Greece': 'GR',
    'Hong Kong': 'HK',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'India': 'IN',
    'Iran': 'IR',
    'Ireland': 'IE',
    'Israel': 'IL',
    'Italy': 'IT',
    'Japan': 'JP',
    'Jordan': 'JO',
    'Latvia': 'LV',
    'Lebanon': 'LB',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Malaysia': 'MY',
    'Malta': 'MT',
    'Mexico': 'MX',
    'Netherlands': 'NL',
    'New Zealand': 'NZ',
    'Norway': 'NO',
    'Philippines': 'PH',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Romania': 'RO',
    'Russia': 'RU',
    'Serbia': 'RS',
    'Singapore': 'SG',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'South Africa': 'ZA',
    'South Korea': 'KR',
    'Spain': 'ES',
    'Sri Lanka': 'LK',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Taiwan': 'TW',
    'Thailand': 'TH',
    'Trinidad and Tobago': 'TT',
    'Turkey': 'TR',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States': 'US',
    'Uruguay': 'UY',
    'Venezuela': 'VE',
    'Vietnam': 'VN'
  };
  
  // Try direct mapping first
  if (countryMap[countryName]) {
    return countryMap[countryName];
  }
  
  // Try to find a partial match
  for (const [name, code] of Object.entries(countryMap)) {
    if (countryName.includes(name) || name.includes(countryName)) {
      return code;
    }
  }
  
  // Default to INTL for unknown countries
  return 'INTL';
};

/**
 * Get the last fetch timestamp for Wikipedia data
 * @returns {Object} Timestamp and age information
 */
export const getWikiHotlinesCacheInfo = () => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (!cachedData) {
    return { 
      timestamp: null, 
      age: null,
      exists: false 
    };
  }
  
  const { timestamp } = JSON.parse(cachedData);
  const now = Date.now();
  const age = now - timestamp;
  const ageInDays = Math.floor(age / (24 * 60 * 60 * 1000));
  
  return {
    timestamp: new Date(timestamp).toLocaleString(),
    age: ageInDays === 0 
      ? 'today' 
      : ageInDays === 1 
        ? 'yesterday' 
        : `${ageInDays} days ago`,
    exists: true
  };
};