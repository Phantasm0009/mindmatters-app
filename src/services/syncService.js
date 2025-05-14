import { getLocalEntries, saveEntry } from './storageService';

const syncData = async () => {
    const localEntries = await getLocalEntries();
    
    if (navigator.onLine && localEntries.length > 0) {
        try {
            const response = await fetch('https://your-backend-api.com/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(localEntries),
            });

            if (response.ok) {
                // Optionally clear local entries after successful sync
                // clearLocalEntries();
            } else {
                console.error('Failed to sync data:', response.statusText);
            }
        } catch (error) {
            console.error('Error syncing data:', error);
        }
    }
};

const setupSyncListener = () => {
    window.addEventListener('online', syncData);
};

export { syncData, setupSyncListener };