/**
 * Service to fetch inspirational quotes
 */

// Fallback quotes to use when offline or API fails
const fallbackQuotes = [
  {
    quote: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    quote: "Your task is not to seek love, but merely to seek and find all the barriers within yourself that you have built against it.",
    author: "Rumi"
  },
  {
    quote: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama"
  },
  {
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    quote: "In the midst of winter, I found there was, within me, an invincible summer.",
    author: "Albert Camus"
  },
  {
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    quote: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis"
  },
  {
    quote: "Peace begins with a smile.",
    author: "Mother Teresa"
  },
  {
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar"
  },
  {
    quote: "When we are no longer able to change a situation, we are challenged to change ourselves.",
    author: "Viktor Frankl"
  },
  {
    quote: "Live in the sunshine, swim the sea, drink the wild air.",
    author: "Ralph Waldo Emerson"
  }
];

/**
 * Fetch a daily inspirational quote
 * @param {boolean} forceRefresh - Whether to bypass cache and fetch a new quote
 * @returns {Promise<Object>} Quote object with author and text
 */
export const fetchDailyQuote = async (forceRefresh = false) => {
  // Check if we have a cached quote and it's still valid for today
  const today = new Date().toDateString();
  const cachedData = localStorage.getItem('dailyQuote');

  if (!forceRefresh && cachedData) {
    try {
      const cached = JSON.parse(cachedData);
      const cacheDate = localStorage.getItem('quoteDate');
      
      if (cacheDate === today) {
        console.log('Using cached quote for today');
        return {
          ...cached,
          success: true,
          source: 'cache'
        };
      }
    } catch (e) {
      console.error('Error reading cached quote', e);
    }
  }

  // Try multiple APIs to ensure we get a quote
  const apis = [
    { 
      name: 'quotable',
      url: 'https://api.quotable.kurokeita.dev/api/quotes/random',
      parser: (data) => ({ 
        quote: data.quote.content, 
        author: data.quote.author.name,
        tags: data.quote.tags.map(tag => tag.name).join(', '),
        authorBio: data.quote.author.bio || ''
      })
    },
    { 
      name: 'zenquotes',
      url: 'https://api.zenquotes.io/v1/random',
      parser: (data) => ({ 
        quote: data[0].q, 
        author: data[0].a 
      })
    },
    { 
      name: 'quotable-legacy',
      url: 'https://api.quotable.io/random',
      parser: (data) => ({ 
        quote: data.content, 
        author: data.author 
      })
    },
    { 
      name: 'type.fit',
      url: 'https://type.fit/api/quotes',
      parser: (data) => {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        return { 
          quote: randomQuote.text, 
          author: randomQuote.author || "Unknown" 
        };
      }
    },
    {
      name: 'quoteGarden',
      url: 'https://quote-garden.onrender.com/api/v3/quotes/random',
      parser: (data) => ({
        quote: data.data[0].quoteText,
        author: data.data[0].quoteAuthor
      })
    }
  ];

  // Try each API in sequence until one works
  for (const api of apis) {
    try {
      // First check if we're online before attempting to fetch
      if (!navigator.onLine) {
        throw new Error('You are offline');
      }
      
      console.log(`Trying to fetch quote from ${api.name}...`);
      const response = await fetch(api.url, { 
        signal: AbortSignal.timeout(5000)  // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const quoteData = api.parser(data);
      
      if (quoteData.quote && quoteData.author) {
        // Cache the successful result
        localStorage.setItem('dailyQuote', JSON.stringify(quoteData));
        localStorage.setItem('quoteDate', today);
        
        console.log(`Successfully fetched quote from ${api.name}`);
        
        return {
          ...quoteData,
          success: true,
          source: api.name
        };
      }
      
      throw new Error('Invalid quote data format');
    } catch (error) {
      console.warn(`Failed to fetch from ${api.name}:`, error);
      // Continue to next API
    }
  }
  
  // If all APIs fail, use a random fallback quote
  console.log('All APIs failed, using fallback quote');
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  const fallbackQuote = fallbackQuotes[randomIndex];
  
  return {
    ...fallbackQuote,
    success: false,
    source: 'fallback',
    error: 'Could not connect to quote services'
  };
};

/**
 * Get a random quote from the fallback collection
 * @returns {Object} Quote object
 */
export const getRandomFallbackQuote = () => {
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  return fallbackQuotes[randomIndex];
};