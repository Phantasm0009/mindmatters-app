import React, { useState, useEffect } from 'react';
import { fetchDailyQuote } from '../services/quoteService';
import './DailyQuote.css';

const DailyQuote = () => {
  const [quote, setQuote] = useState({
    quote: "",
    author: "",
    tags: "",
    authorBio: "",
    loading: true,
    error: false,
    source: null
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showCopied, setShowCopied] = useState(false);
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);

  // Monitor online status
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

  const getQuote = async (forceRefresh = false) => {
    if (refreshing) return;
    
    setRefreshing(true);
    setQuote(prev => ({ ...prev, loading: true }));
    
    try {
      const quoteData = await fetchDailyQuote(forceRefresh);
      setQuote({
        quote: quoteData.quote,
        author: quoteData.author,
        tags: quoteData.tags || "",
        authorBio: quoteData.authorBio || "",
        loading: false,
        error: !quoteData.success,
        source: quoteData.source
      });
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuote({
        quote: "Take a deep breath and try again.",
        author: "MindMatters",
        tags: "",
        authorBio: "",
        loading: false,
        error: true,
        source: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    // Check if we have a stored quote for today
    const storedQuote = localStorage.getItem('dailyQuote');
    const storedDate = localStorage.getItem('quoteDate');
    const today = new Date().toDateString();
    
    if (storedQuote && storedDate === today) {
      try {
        const parsedQuote = JSON.parse(storedQuote);
        setQuote({
          ...parsedQuote,
          loading: false,
          source: 'cache'
        });
      } catch (e) {
        getQuote();
      }
    } else {
      getQuote();
    }
  }, []);
  
  // Store the quote when we get a new one
  useEffect(() => {
    if (!quote.loading && quote.quote) {
      localStorage.setItem('dailyQuote', JSON.stringify({
        quote: quote.quote,
        author: quote.author,
        tags: quote.tags,
        authorBio: quote.authorBio
      }));
      localStorage.setItem('quoteDate', new Date().toDateString());
    }
  }, [quote]);

  const copyQuote = () => {
    const textToCopy = `"${quote.quote}" — ${quote.author}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const toggleAuthorInfo = () => {
    setShowAuthorInfo(!showAuthorInfo);
  };

  return (
    <div className="daily-quote">
      <h2>
        🧠 Daily Inspiration
        {!isOnline && <span className="offline-indicator">Offline Mode</span>}
      </h2>
      
      <div className={`quote-content ${quote.loading ? 'loading' : ''}`}>
        {quote.loading ? (
          <div className="quote-loading">
            <div className="quote-spinner"></div>
            <p>Finding inspiration...</p>
          </div>
        ) : (
          <>
            <blockquote>
              <p>"{quote.quote}"</p>
              <footer>
                <span 
                  className={`author-name ${quote.authorBio ? 'has-bio' : ''}`}
                  onClick={quote.authorBio ? toggleAuthorInfo : undefined}
                >
                  — {quote.author}
                  {quote.authorBio && <span className="info-icon">ℹ️</span>}
                </span>
                {quote.source === 'fallback' && <span className="offline-quote">(offline quote)</span>}
              </footer>
              
              {quote.tags && (
                <div className="quote-tags">
                  {quote.tags.split(', ').map(tag => (
                    <span key={tag} className="quote-tag">{tag}</span>
                  ))}
                </div>
              )}
              
              {showAuthorInfo && quote.authorBio && (
                <div className="author-bio">
                  <h4>{quote.author}</h4>
                  <p>{quote.authorBio}</p>
                </div>
              )}
            </blockquote>
            
            <div className="quote-actions">
              <button 
                onClick={() => getQuote(true)} 
                className="refresh-quote" 
                disabled={refreshing || !isOnline}
                aria-label="Get a new quote"
              >
                <span className={`refresh-icon ${refreshing ? 'spinning' : ''}`}>↻</span>
                <span className="refresh-text">{refreshing ? 'Loading...' : 'New Quote'}</span>
              </button>
              
              <button 
                onClick={copyQuote} 
                className="copy-quote"
                aria-label="Copy quote to clipboard"
              >
                <span className="copy-icon">📋</span>
                <span className="copy-text">{showCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyQuote;