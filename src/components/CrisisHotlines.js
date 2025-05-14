import React, { useState, useEffect } from 'react';
import { getUserCountry } from '../services/geoLocationService';
import { getCombinedHotlines, getHotlinesForCountry, getAvailableCountries, getHotlinesCacheStatus } from '../services/crisisHotlineService';
import './CrisisHotlines.css';

const CrisisHotlines = () => {
  const [userCountry, setUserCountry] = useState(null);
  const [countryHotlines, setCountryHotlines] = useState(null);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [allHotlines, setAllHotlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get the user's country
        const country = await getUserCountry();
        setUserCountry(country);
        
        // Get combined hotlines
        const { hotlines, source, wikiSuccess, error } = await getCombinedHotlines();
        setAllHotlines(hotlines);
        setDataSource({ source, wikiSuccess, error });
        
        // Get cache information
        const cacheStatus = getHotlinesCacheStatus();
        setCacheInfo(cacheStatus);
        
        // Get available countries with hotlines
        const countries = getAvailableCountries(hotlines);
        setAvailableCountries(countries);
        
        // Set the initial selected country to user's country or first in list
        const initialCountry = country?.countryCode || (countries.length > 0 ? countries[0].code : null);
        setSelectedCountry(initialCountry);
        
        // Get hotlines for the country
        if (initialCountry) {
          const countryData = getHotlinesForCountry(hotlines, initialCountry);
          setCountryHotlines(countryData);
        }
      } catch (err) {
        console.error("Error fetching hotline data:", err);
        setError("Could not retrieve crisis hotlines. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    const hotlines = getHotlinesForCountry(allHotlines, countryCode);
    setCountryHotlines(hotlines);
  };

  const handleRefreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Force refresh of Wikipedia data
      const { hotlines, source, wikiSuccess, error } = await getCombinedHotlines(true);
      setAllHotlines(hotlines);
      setDataSource({ source, wikiSuccess, error });
      
      // Update cache information
      const cacheStatus = getHotlinesCacheStatus();
      setCacheInfo(cacheStatus);
      
      // Update available countries
      const countries = getAvailableCountries(hotlines);
      setAvailableCountries(countries);
      
      // Update selected country's data
      if (selectedCountry) {
        const countryData = getHotlinesForCountry(hotlines, selectedCountry);
        setCountryHotlines(countryData);
      }
      
      // Show success message
      setError("Crisis hotlines updated successfully!");
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error refreshing hotline data:", err);
      setError("Failed to refresh crisis hotlines. Please check your connection.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const callHotline = (phoneNumber) => {
    if (phoneNumber && !phoneNumber.toLowerCase().startsWith('text')) {
      window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    }
  };

  return (
    <div className="crisis-hotlines">
      <h2>
        <span className="emergency-icon">🆘</span> 
        Emergency Crisis Hotlines
      </h2>
      
      {loading ? (
        <div className="hotlines-loading">
          <div className="hotlines-spinner"></div>
          <p>Finding emergency resources for your location...</p>
        </div>
      ) : (
        <>
          <div className="country-selection">
            <div className="country-selector">
              <label htmlFor="country-select">
                Select your country:
                {userCountry && userCountry.source === 'api' && (
                  <span className="detected-country"> 
                    (Detected: {userCountry.country})
                  </span>
                )}
              </label>
              <select 
                id="country-select" 
                value={selectedCountry || ''} 
                onChange={handleCountryChange}
              >
                {availableCountries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="data-source-info">
              {dataSource && (
                <div className={`data-source ${dataSource.wikiSuccess ? 'wiki-success' : 'wiki-error'}`}>
                  <span>
                    Source: {dataSource.wikiSuccess ? 'Wikipedia + Local Database' : 'Local Database Only'}
                  </span>
                  {cacheInfo && cacheInfo.exists && (
                    <span className="cache-age">Updated: {cacheInfo.age}</span>
                  )}
                  <button 
                    onClick={handleRefreshData} 
                    disabled={isRefreshing || !navigator.onLine}
                    className="refresh-button"
                    title="Update crisis hotlines from Wikipedia"
                  >
                    <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>↻</span>
                    <span className="refresh-text">Update</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className={`hotlines-message ${error.includes('successfully') ? 'success' : 'error'}`}>
              <p>{error}</p>
            </div>
          )}
          
          <div className="emergency-notice">
            <p className="emergency-text">
              <strong>If you are in immediate danger of harming yourself or others,
              please call your local emergency services (such as 911 in the US) immediately.</strong>
            </p>
          </div>
          
          {countryHotlines && (
            <div className="hotlines-list">
              <h3>Crisis Support in {countryHotlines.country}</h3>
              {countryHotlines.hotlines.map((hotline, index) => (
                <div key={index} className="hotline-card">
                  <h4 className="hotline-name">{hotline.name}</h4>
                  
                  {hotline.phone && (
                    <div 
                      className={`hotline-phone ${!hotline.phone.toLowerCase().startsWith('text') ? 'clickable' : ''}`}
                      onClick={() => callHotline(hotline.phone)}
                    >
                      <span className="phone-icon">📞</span> {hotline.phone}
                    </div>
                  )}
                  
                  {hotline.altPhone && (
                    <div 
                      className={`hotline-alt-phone ${!hotline.altPhone.toLowerCase().startsWith('text') ? 'clickable' : ''}`}
                      onClick={() => callHotline(hotline.altPhone)}
                    >
                      <span className="phone-icon">📞</span> {hotline.altPhone}
                    </div>
                  )}
                  
                  {hotline.description && (
                    <div className="hotline-description">
                      {hotline.description}
                    </div>
                  )}
                  
                  {hotline.website && (
                    <a 
                      href={hotline.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hotline-website"
                    >
                      Visit Website <span className="external-icon">↗️</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="additional-resources">
            <h3>Additional Resources</h3>
            <p>
              International Association for Suicide Prevention: 
              <a 
                href="https://www.iasp.info/resources/Crisis_Centres/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Find more crisis centers worldwide
              </a>
            </p>
            <p>
              Wikipedia List of Suicide Crisis Lines: 
              <a 
                href="https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View complete list
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CrisisHotlines;