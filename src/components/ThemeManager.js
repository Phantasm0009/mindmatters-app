import React, { useState, useEffect, createContext, useContext } from 'react';
import { getMoodColorPalette, createThemeFromPalette, rgbToHex } from '../services/colorService';
import { getMoodEntries } from '../services/storageService';
import './ThemeManager.css';

// Create theme context
const ThemeContext = createContext();

// Hook for components to access theme
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('auto');
  const [customTheme, setCustomTheme] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  
  // Apply theme when it changes
  useEffect(() => {
    let isMounted = true;
    
    const applyTheme = async () => {
      setIsApplying(true);
      try {
        let themeVars;
        let appliedMood = null;
        
        // Check what type of theme we're using
        if (currentTheme === 'auto') {
          // Get the last recorded mood
          const lastMoodEntry = await getLastMoodEntry();
          if (lastMoodEntry && lastMoodEntry.moodValue) {
            themeVars = await getAndApplyMoodTheme(lastMoodEntry.moodValue);
            appliedMood = getMoodName(lastMoodEntry.moodValue);
          } else {
            // Use default if no mood entry
            themeVars = await getAndApplyMoodTheme('neutral');
            appliedMood = 'neutral';
          }
        } else if (currentTheme === 'custom' && customTheme) {
          // Apply custom theme
          applyThemeVariables(customTheme);
          themeVars = customTheme;
        } else {
          // Apply preset theme
          themeVars = await getAndApplyMoodTheme(currentTheme);
          appliedMood = currentTheme;
        }
        
        setCurrentMood(appliedMood);
        
        // Save the theme preference and current mood to localStorage
        localStorage.setItem('themePreference', currentTheme);
        localStorage.setItem('currentMood', appliedMood || '');
        
        if (customTheme) {
          localStorage.setItem('customTheme', JSON.stringify(customTheme));
        }
        
        // Save applied theme variables to ensure they persist on refresh
        localStorage.setItem('appliedThemeVars', JSON.stringify(themeVars));
      } catch (error) {
        console.error("Failed to apply theme:", error);
      } finally {
        if (isMounted) {
          setIsApplying(false);
        }
      }
    };
    
    applyTheme();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [currentTheme, customTheme]);
  
  // Load saved theme preference and applied theme on first render
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        // Get saved theme preference
        const savedTheme = localStorage.getItem('themePreference') || 'auto';
        setCurrentTheme(savedTheme);
        
        // Get saved mood
        const savedMood = localStorage.getItem('currentMood');
        if (savedMood) {
          setCurrentMood(savedMood);
        }
        
        // Get saved custom theme
        const savedCustomTheme = localStorage.getItem('customTheme');
        if (savedCustomTheme) {
          try {
            const parsedTheme = JSON.parse(savedCustomTheme);
            setCustomTheme(parsedTheme);
          } catch (e) {
            console.error("Couldn't parse saved custom theme", e);
          }
        }
        
        // Apply saved theme variables immediately for fast loading
        const savedThemeVars = localStorage.getItem('appliedThemeVars');
        if (savedThemeVars) {
          try {
            const parsedVars = JSON.parse(savedThemeVars);
            applyThemeVariables(parsedVars);
          } catch (e) {
            console.error("Couldn't apply saved theme variables", e);
          }
        }
      } catch (error) {
        console.error("Error loading saved theme:", error);
      }
    };
    
    loadSavedTheme();
  }, []);
  
  // Get last mood entry from storage
  const getLastMoodEntry = async () => {
    try {
      const entries = await getMoodEntries();
      if (entries && entries.length > 0) {
        // Sort by date descending
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        return entries[0];
      }
    } catch (error) {
      console.error("Error getting last mood entry:", error);
    }
    return null;
  };
  
  const getMoodName = (moodValue) => {
    if (moodValue <= 2) return 'sad';
    if (moodValue === 3) return 'anxious';
    if (moodValue === 4) return 'stressed';
    if (moodValue === 5) return 'neutral';
    if (moodValue === 6) return 'tired';
    if (moodValue === 7) return 'calm';
    if (moodValue === 8) return 'relaxed';
    if (moodValue === 9) return 'happy';
    return 'excited';
  };
  
  // Apply theme based on mood
  const getAndApplyMoodTheme = async (mood) => {
    try {
      const palette = await getMoodColorPalette(mood);
      const themeVars = createThemeFromPalette(palette);
      applyThemeVariables(themeVars);
      return themeVars;
    } catch (error) {
      console.error("Error applying mood theme:", error);
      throw error;
    }
  };
  
  // Apply CSS variables to root
  const applyThemeVariables = (variables) => {
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };
  
  // Handle theme change
  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    setShowPicker(false);
  };
  
  // Generate theme from specific mood
  const generateThemeFromMood = async (mood) => {
    setIsApplying(true);
    try {
      const themeVars = await getAndApplyMoodTheme(mood);
      
      // When generating a theme from mood, set it as custom theme
      setCustomTheme(themeVars);
      setCurrentTheme('custom');
      setCurrentMood(mood);
      
      // Save the generated theme
      localStorage.setItem('customTheme', JSON.stringify(themeVars));
      localStorage.setItem('themePreference', 'custom');
      localStorage.setItem('currentMood', mood);
      localStorage.setItem('appliedThemeVars', JSON.stringify(themeVars));
      
      return themeVars;
    } catch (error) {
      console.error("Failed to generate theme from mood:", error);
      return null;
    } finally {
      setIsApplying(false);
    }
  };
  
  // Context value
  const themeContextValue = {
    currentTheme,
    currentMood,
    changeTheme,
    generateThemeFromMood,
    isApplying
  };
  
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className="theme-manager-container">
        {children}
        
        <button 
          className="theme-picker-button"
          onClick={() => setShowPicker(!showPicker)}
          aria-label="Change theme"
        >
          <span className="theme-icon">🎨</span>
        </button>
        
        {showPicker && (
          <div className="theme-picker">
            <h3>Color Theme</h3>
            <div className="theme-options">
              <button 
                className={`theme-option ${currentTheme === 'auto' ? 'active' : ''}`}
                onClick={() => changeTheme('auto')}
              >
                <div className="theme-preview auto"></div>
                <span className="theme-label">Match Mood</span>
              </button>
              <button 
                className={`theme-option ${currentTheme === 'happy' ? 'active' : ''}`}
                onClick={() => changeTheme('happy')}
              >
                <div className="theme-preview happy"></div>
                <span className="theme-label">Happy</span>
              </button>
              <button 
                className={`theme-option ${currentTheme === 'calm' ? 'active' : ''}`}
                onClick={() => changeTheme('calm')}
              >
                <div className="theme-preview calm"></div>
                <span className="theme-label">Calm</span>
              </button>
              <button 
                className={`theme-option ${currentTheme === 'neutral' ? 'active' : ''}`}
                onClick={() => changeTheme('neutral')}
              >
                <div className="theme-preview neutral"></div>
                <span className="theme-label">Neutral</span>
              </button>
            </div>
            
            <div className="generate-theme">
              <h4>Generate Theme from Emotion</h4>
              <div className="mood-buttons">
                <button 
                  onClick={() => generateThemeFromMood('excited')}
                  disabled={isApplying}
                  className="mood-excited"
                >
                  Excited 😃
                </button>
                <button 
                  onClick={() => generateThemeFromMood('happy')}
                  disabled={isApplying}
                  className="mood-happy"
                >
                  Happy 😊
                </button>
                <button 
                  onClick={() => generateThemeFromMood('calm')}
                  disabled={isApplying}
                  className="mood-calm"
                >
                  Calm 😌
                </button>
                <button 
                  onClick={() => generateThemeFromMood('relaxed')}
                  disabled={isApplying}
                  className="mood-relaxed"
                >
                  Relaxed 😇
                </button>
                <button 
                  onClick={() => generateThemeFromMood('neutral')}
                  disabled={isApplying}
                  className="mood-neutral"
                >
                  Neutral 😐
                </button>
                <button 
                  onClick={() => generateThemeFromMood('sad')}
                  disabled={isApplying}
                  className="mood-sad"
                >
                  Sad 😢
                </button>
                <button 
                  onClick={() => generateThemeFromMood('anxious')}
                  disabled={isApplying}
                  className="mood-anxious"
                >
                  Anxious 😰
                </button>
                <button 
                  onClick={() => generateThemeFromMood('tired')}
                  disabled={isApplying}
                  className="mood-tired"
                >
                  Tired 😴
                </button>
              </div>
            </div>
            
            {currentMood && (
              <div style={{marginTop: '15px', textAlign: 'center', fontSize: '0.9rem', opacity: 0.7}}>
                Current mood theme: <strong>{currentMood}</strong>
              </div>
            )}
            
            {isApplying && (
              <div className="theme-applying">
                <div className="theme-spinner"></div>
                <span>Applying theme...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
};