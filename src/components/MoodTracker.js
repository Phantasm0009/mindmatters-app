import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getMoodData } from '../services/storageService';
import './MoodTracker.css';

// Register Chart.js components
ChartJS.register(...registerables);

const MoodTracker = () => {
    const [moodData, setMoodData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [showGrid, setShowGrid] = useState(true);
    const [chartDataState, setChartDataState] = useState({
        labels: [],
        datasets: [{
            label: 'Mood Trend',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        }]
    });

    useEffect(() => {
        const fetchMoodData = async () => {
            setLoading(true);
            try {
                // In a real app, fetch from your storage service
                const data = await getMoodData();
                // If no data yet, use sample data for demonstration
                const moods = data && data.length > 0 ? data : generateSampleMoodData();
                setMoodData(moods);
            } catch (error) {
                console.error("Error fetching mood data:", error);
                // Fallback to sample data if there's an error
                setMoodData(generateSampleMoodData());
            } finally {
                setLoading(false);
            }
        };

        fetchMoodData();
    }, []);

    // Update chart data whenever mood data or time range changes
    useEffect(() => {
        if (moodData && moodData.length > 0) {
            updateChartData();
        }
    }, [moodData, timeRange]);

    const generateSampleMoodData = () => {
        // Create sample data with a realistic pattern
        const today = new Date();
        const sampleData = [];
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            // Generate a somewhat realistic mood pattern
            let moodValue;
            
            if (i % 7 === 0) {
                // Weekend effect - slightly happier
                moodValue = Math.min(10, Math.floor(Math.random() * 3) + 7);
            } else if (i % 5 === 0) {
                // Some bad days
                moodValue = Math.max(1, Math.floor(Math.random() * 3) + 2);
            } else {
                // Normal days - between 4 and 8
                moodValue = Math.floor(Math.random() * 5) + 4;
            }
            
            sampleData.push({
                date: date.toISOString().split('T')[0],
                moodValue: moodValue,
                mood: getMoodLabel(moodValue - 1)
            });
        }
        
        return sampleData;
    };

    const filteredData = () => {
        if (!moodData || moodData.length === 0) {
            return [];
        }
        
        const now = new Date();
        let cutoff = new Date();
        
        if (timeRange === 'week') {
            cutoff.setDate(now.getDate() - 7);
        } else if (timeRange === 'month') {
            cutoff.setMonth(now.getMonth() - 1);
        } else if (timeRange === 'year') {
            cutoff.setFullYear(now.getFullYear() - 1);
        } else {
            // All time - no filtering
            return moodData;
        }
        
        return moodData.filter(entry => new Date(entry.date) >= cutoff);
    };

    const formatDisplayDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Generate beautiful gradient for the chart
    const createGradient = (ctx) => {
        if (!ctx) return 'rgba(66, 133, 244, 0.2)';
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(66, 133, 244, 0.6)');
        gradient.addColorStop(1, 'rgba(66, 133, 244, 0.1)');
        return gradient;
    };

    // Update chart data state
    const updateChartData = () => {
        const filtered = filteredData();
        
        if (!filtered || filtered.length === 0) {
            setChartDataState({
                labels: [],
                datasets: [{
                    label: 'Mood Trend',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
                }]
            });
            return;
        }
        
        try {
            const labels = filtered.map(entry => formatDisplayDate(entry.date));
            const data = filtered.map(entry => entry.moodValue || 0);
            
            setChartDataState({
                labels: labels,
                datasets: [{
                    label: 'Mood Level',
                    data: data,
                    borderColor: 'rgba(66, 133, 244, 1)',
                    backgroundColor: 'rgba(66, 133, 244, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(66, 133, 244, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            });
        } catch (error) {
            console.error("Error updating chart data:", error);
            // Set fallback empty data structure
            setChartDataState({
                labels: [],
                datasets: [{
                    label: 'Mood Trend',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
                }]
            });
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#555',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                bodyFont: {
                    size: 14
                },
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    },
                    label: function(context) {
                        return `Mood: ${context.raw}/10`;
                    },
                    afterLabel: function(context) {
                        const filtered = filteredData();
                        if (!filtered || !context || context.dataIndex === undefined) return '';
                        const entry = filtered[context.dataIndex];
                        return entry && entry.mood ? `Feeling: ${entry.mood}` : '';
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12
                    },
                    color: '#666'
                },
                title: {
                    display: true,
                    text: 'Mood Level',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#555'
                },
                grid: {
                    display: showGrid,
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 11
                    },
                    color: '#666',
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: {
                    display: showGrid,
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    };

    const calculateMoodStatistics = () => {
        const filtered = filteredData();
        
        if (!filtered || filtered.length === 0) {
            return {
                avg: "0.0",
                highest: "0",
                lowest: "0",
                entries: 0
            };
        }
        
        const moodValues = filtered.map(entry => entry.moodValue);
        const sum = moodValues.reduce((total, value) => total + value, 0);
        const avg = (sum / moodValues.length).toFixed(1);
        const highest = Math.max(...moodValues);
        const lowest = Math.min(...moodValues);
        
        return {
            avg,
            highest,
            lowest,
            entries: filtered.length
        };
    };

    const stats = calculateMoodStatistics();
    
    // Helper function for mood labels
    function getMoodLabel(value) {
        const labels = [
            'Very sad', 'Sad', 'Down', 'Neutral', 'Okay', 
            'Good', 'Happy', 'Very happy', 'Excellent', 'Amazing'
        ];
        return labels[value] || 'Neutral';
    }

    return (
        <div className="mood-tracker">
            <h2>Mood Trends</h2>
            
            <div className="chart-controls">
                <div className="time-range-selector">
                    <button 
                        className={timeRange === 'week' ? 'active' : ''} 
                        onClick={() => setTimeRange('week')}>
                        Week
                    </button>
                    <button 
                        className={timeRange === 'month' ? 'active' : ''} 
                        onClick={() => setTimeRange('month')}>
                        Month
                    </button>
                    <button 
                        className={timeRange === 'year' ? 'active' : ''} 
                        onClick={() => setTimeRange('year')}>
                        Year
                    </button>
                    <button 
                        className={timeRange === 'all' ? 'active' : ''} 
                        onClick={() => setTimeRange('all')}>
                        All Time
                    </button>
                </div>
                
                <label className="toggle-grid">
                    <input 
                        type="checkbox" 
                        checked={showGrid} 
                        onChange={() => setShowGrid(!showGrid)} 
                    />
                    Show Grid
                </label>
            </div>
            
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your mood data...</p>
                </div>
            ) : (
                <>
                    <div className="chart-container">
                        {moodData && moodData.length > 0 ? (
                            <Line data={chartDataState} options={chartOptions} />
                        ) : (
                            <div className="no-data-message">
                                <p>No mood data available yet. Start logging your daily moods!</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mood-statistics">
                        <div className="stat-card">
                            <div className="stat-value">{stats.avg}</div>
                            <div className="stat-label">Average Mood</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.highest}</div>
                            <div className="stat-label">Highest Mood</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.lowest}</div>
                            <div className="stat-label">Lowest Mood</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.entries}</div>
                            <div className="stat-label">Total Entries</div>
                        </div>
                    </div>
                    
                    <div className="mood-insights">
                        <h3>Insights</h3>
                        {filteredData().length > 0 ? (
                            <>
                                <p>Your average mood is <span className="highlight">{stats.avg}/10</span> over the selected period.</p>
                                {stats.entries > 3 && (
                                    <p>You've been consistently tracking your mood - great job maintaining your mental health routine!</p>
                                )}
                                {timeRange !== 'week' && stats.entries > 7 && (
                                    <p>Tip: Looking at weekly patterns can help identify specific triggers that affect your mood.</p>
                                )}
                            </>
                        ) : (
                            <p>Not enough data for this time period. Keep logging entries to see insights.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MoodTracker;