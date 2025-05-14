export const calculateMoodTrends = (moodEntries) => {
    const moodCounts = {};
    moodEntries.forEach(entry => {
        const mood = entry.mood;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const totalEntries = moodEntries.length;
    const moodTrends = Object.keys(moodCounts).map(mood => ({
        mood,
        percentage: ((moodCounts[mood] / totalEntries) * 100).toFixed(2)
    }));

    return moodTrends;
};

export const getMoodAverage = (moodEntries) => {
    if (moodEntries.length === 0) return 0;

    const totalMood = moodEntries.reduce((sum, entry) => sum + entry.moodValue, 0);
    return (totalMood / moodEntries.length).toFixed(2);
};

export const formatMoodData = (moodEntries) => {
    // Convert the raw mood entries into a format suitable for charts
    return moodEntries.map(entry => ({
        date: new Date(entry.date).toLocaleDateString(),
        mood: entry.moodValue || 0,
        thoughts: entry.thoughts || ""
    }));
};

export const prepareMoodDataForChart = (moodEntries) => {
    const labels = moodEntries.map(entry => entry.date);
    const data = moodEntries.map(entry => entry.moodValue);

    return {
        labels,
        datasets: [{
            label: 'Mood Trend',
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        }]
    };
};