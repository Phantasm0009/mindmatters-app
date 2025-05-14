import { openDB } from 'idb';

const DB_NAME = 'MindMattersDB';
const DB_VERSION = 1;
let dbPromise = null;

// Initialize database with retry logic
const getDB = async () => {
  if (!dbPromise) {
    try {
      dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          console.log('Creating database schema...');
          
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('moodEntries')) {
            const store = db.createObjectStore('moodEntries', { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('synced', 'synced', { unique: false });
            console.log('Created moodEntries store');
          }
          
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
            console.log('Created settings store');
          }
        }
      });
    } catch (error) {
      console.error('Database initialization error:', error);
      return null;
    }
  }
  return dbPromise;
};

// Add a mood entry
export const addMoodEntry = async (entry) => {
    try {
        const db = await getDB();
        if (db) {
            await db.add('moodEntries', entry);
        }
    } catch (error) {
        console.error('Error adding mood entry:', error);
    }
};

// Get all mood entries
export const getMoodEntries = async () => {
  try {
    const db = await getDB();
    return db ? await db.getAll('moodEntries') : [];
  } catch (error) {
    console.error('Error getting mood entries:', error);
    return []; // Return empty array as fallback
  }
};

// Get mood data function explicitly exported
export const getMoodData = async () => {
    try {
        return await getMoodEntries();
    } catch (error) {
        console.error("Error fetching mood data:", error);
        return []; // Return empty array on error
    }
};

// Save journal entry (combined function for mood and journal)
export const saveJournalEntry = async (entry) => {
    try {
        const db = await getDB();
        if (db) {
            await db.add('moodEntries', entry);
        }
        return true;
    } catch (error) {
        console.error('Error saving journal entry:', error);
        return false;
    }
};

// Clear all mood entries
export const clearMoodEntries = async () => {
    try {
        const db = await getDB();
        if (db) {
            await db.clear('moodEntries');
        }
    } catch (error) {
        console.error('Error clearing mood entries:', error);
    }
};

// Get mood entries by date
export const getMoodEntriesByDate = async (date) => {
    try {
        const entries = await getMoodEntries();
        return entries.filter(entry => entry.date === date);
    } catch (error) {
        console.error('Error getting mood entries by date:', error);
        return [];
    }
};