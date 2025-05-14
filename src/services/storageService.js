import { openDB } from 'idb';

const DB_NAME = 'MindMattersDB';
const STORE_NAME = 'moodEntries';

// Initialize the database
const initDB = async () => {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
            }
        },
    });
    return db;
};

// Add a mood entry
export const addMoodEntry = async (entry) => {
    const db = await initDB();
    await db.add(STORE_NAME, entry);
};

// Get all mood entries
export const getMoodEntries = async () => {
    const db = await initDB();
    return await db.getAll(STORE_NAME);
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
    const db = await initDB();
    await db.add(STORE_NAME, entry);
    return true;
};

// Clear all mood entries
export const clearMoodEntries = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME);
};

// Get mood entries by date
export const getMoodEntriesByDate = async (date) => {
    const entries = await getMoodEntries();
    return entries.filter(entry => entry.date === date);
};