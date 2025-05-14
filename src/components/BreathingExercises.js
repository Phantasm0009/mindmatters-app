import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeManager';
import './BreathingExercises.css';

const BreathingExercises = () => {
    const [activeExercise, setActiveExercise] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [counter, setCounter] = useState(0);
    const [phase, setPhase] = useState('');
    const [cycles, setCycles] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [progress, setProgress] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const phaseTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const { currentTheme } = useTheme();
    
    const exercises = [
        {
            id: 'box',
            title: "Box Breathing",
            description: "A powerful stress-reducer used by Navy SEALs. Creates a rhythm of equal parts inhale, hold, exhale, and hold.",
            phases: [
                { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose, filling your lungs completely' },
                { name: 'Hold', duration: 4, instruction: 'Hold your breath, keeping your chest expanded' },
                { name: 'Exhale', duration: 4, instruction: 'Release breath slowly through your mouth with pursed lips' },
                { name: 'Hold', duration: 4, instruction: 'Keep lungs empty and relax your chest' }
            ],
            totalCycles: 4,
            benefits: [
                "Reduces stress and anxiety",
                "Improves concentration and focus",
                "Regulates autonomic nervous system",
                "Can be done anywhere, anytime"
            ],
            category: 'stress',
            color: '#4285f4',
            animationType: 'box',
            icon: '⬛'
        },
        {
            id: '4-7-8',
            title: "4-7-8 Breathing",
            description: "Developed by Dr. Andrew Weil, this technique acts as a natural tranquilizer for the nervous system.",
            phases: [
                { name: 'Inhale', duration: 4, instruction: 'Breathe in quietly through your nose for a count of 4' },
                { name: 'Hold', duration: 7, instruction: 'Hold your breath for a count of 7, maintaining relaxed muscles' },
                { name: 'Exhale', duration: 8, instruction: 'Exhale completely through your mouth with a whooshing sound for 8 counts' }
            ],
            totalCycles: 4,
            benefits: [
                "Helps you fall asleep quickly",
                "Manages food cravings",
                "Reduces anxiety and stress",
                "Controls emotional responses"
            ],
            category: 'sleep',
            color: '#673ab7',
            animationType: 'circle',
            icon: '🌙'
        },
        {
            id: 'diaphragmatic',
            title: "Diaphragmatic Breathing",
            description: "Also known as 'belly breathing', it strengthens the diaphragm and reduces stress by encouraging full oxygen exchange.",
            phases: [
                { name: 'Inhale', duration: 5, instruction: 'Breathe in deeply through your nose, expanding your belly, not your chest' },
                { name: 'Exhale', duration: 5, instruction: 'Breathe out slowly through pursed lips, feeling your belly contract' }
            ],
            totalCycles: 5,
            benefits: [
                "Slows heart rate and lowers blood pressure",
                "Strengthens diaphragm muscles",
                "Reduces cortisol levels",
                "Improves core muscle stability"
            ],
            category: 'focus',
            color: '#0f9d58',
            animationType: 'wave',
            icon: '🌊'
        },
        {
            id: 'resonant',
            title: "Resonant Breathing",
            description: "Breathe at a rate of 5-7 breaths per minute to achieve resonance with heart rhythms and optimize HRV (Heart Rate Variability).",
            phases: [
                { name: 'Inhale', duration: 5.5, instruction: 'Breathe in slowly through your nose for 5.5 seconds' },
                { name: 'Exhale', duration: 5.5, instruction: 'Breathe out slowly through your nose for 5.5 seconds' }
            ],
            totalCycles: 6,
            benefits: [
                "Optimizes heart rate variability",
                "Creates mind-body coherence",
                "Boosts immune system function",
                "Enhances emotional regulation"
            ],
            category: 'calm',
            color: '#ff6d00',
            animationType: 'pulse',
            icon: '💓'
        },
        {
            id: '2-to-1',
            title: "2-to-1 Breathing",
            description: "Emphasizes longer exhalations to activate the parasympathetic nervous system for deep relaxation and stress relief.",
            phases: [
                { name: 'Inhale', duration: 4, instruction: 'Breathe in through your nose for a count of 4' },
                { name: 'Exhale', duration: 8, instruction: 'Breathe out slowly through your nose or mouth for a count of 8' }
            ],
            totalCycles: 5,
            benefits: [
                "Activates the relaxation response",
                "Reduces blood pressure quickly",
                "Helps with insomnia",
                "Calms anxious thoughts"
            ],
            category: 'sleep',
            color: '#db4437',
            animationType: 'expand',
            icon: '🌬️'
        },
        {
            id: 'alternate-nostril',
            title: "Alternate Nostril Breathing",
            description: "Traditional yogic practice (Nadi Shodhana) that balances the hemispheres of your brain and promotes mental clarity.",
            phases: [
                { name: 'Close Right Nostril', duration: 2, instruction: 'Use your right thumb to close your right nostril' },
                { name: 'Inhale Left', duration: 4, instruction: 'Breathe in slowly through your left nostril' },
                { name: 'Close Both Nostrils', duration: 2, instruction: 'Close both nostrils with your thumb and ring finger' },
                { name: 'Open Right Nostril', duration: 2, instruction: 'Release your thumb from your right nostril' },
                { name: 'Exhale Right', duration: 4, instruction: 'Breathe out through your right nostril' },
                { name: 'Inhale Right', duration: 4, instruction: 'Breathe in through your right nostril' },
                { name: 'Close Both Nostrils', duration: 2, instruction: 'Close both nostrils again' },
                { name: 'Open Left Nostril', duration: 2, instruction: 'Release your ring finger from your left nostril' },
                { name: 'Exhale Left', duration: 4, instruction: 'Breathe out through your left nostril' }
            ],
            totalCycles: 3,
            benefits: [
                "Balances left and right brain hemispheres",
                "Enhances mental clarity and alertness",
                "Prepares the mind for meditation",
                "Purifies subtle energy channels"
            ],
            category: 'focus',
            color: '#9c27b0',
            animationType: 'alternate',
            icon: '👃'
        },
        {
            id: 'progressive',
            title: "Progressive Relaxation Breathing",
            description: "Combines deep breathing with muscle relaxation to systematically release physical tension throughout your body.",
            phases: [
                { name: 'Inhale', duration: 4, instruction: 'Breathe in deeply, gently tensing your muscles' },
                { name: 'Hold', duration: 2, instruction: 'Hold your breath and the tension' },
                { name: 'Exhale', duration: 6, instruction: 'Breathe out slowly, releasing all tension' },
                { name: 'Rest', duration: 2, instruction: 'Rest and notice the sensation of relaxation' }
            ],
            totalCycles: 4,
            benefits: [
                "Releases chronic muscle tension",
                "Improves body awareness",
                "Reduces physical symptoms of stress",
                "Helps with chronic pain management"
            ],
            category: 'stress',
            color: '#795548',
            animationType: 'relax',
            icon: '🧠'
        },
        {
            id: 'coherent',
            title: "Coherent Breathing",
            description: "A simple yet powerful technique that promotes heart-brain coherence through a steady rhythm of 5 breaths per minute.",
            phases: [
                { name: 'Inhale', duration: 6, instruction: 'Breathe in slowly through your nose for a count of 6' },
                { name: 'Exhale', duration: 6, instruction: 'Breathe out slowly through your nose for a count of 6' }
            ],
            totalCycles: 5,
            benefits: [
                "Synchronizes heart rate variability",
                "Enhances cognitive performance",
                "Improves emotional stability",
                "Reduces symptoms of anxiety and depression"
            ],
            category: 'calm',
            color: '#03a9f4',
            animationType: 'sphere',
            icon: '🔵'
        }
    ];

    const categories = [
        { id: 'all', name: 'All Exercises' },
        { id: 'stress', name: 'Stress Relief' },
        { id: 'focus', name: 'Focus & Clarity' },
        { id: 'sleep', name: 'Sleep Aid' },
        { id: 'calm', name: 'Calming' }
    ];

    const clearAllTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        timerRef.current = null;
        phaseTimerRef.current = null;
        countdownIntervalRef.current = null;
    };

    useEffect(() => {
        return () => {
            clearAllTimers();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playSound = (soundType) => {
        try {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch (soundType) {
                case 'inhale':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 440;
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.6);
                    break;
                case 'exhale':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 330;
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.7);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.8);
                    break;
                case 'hold':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 392;
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.4);
                    break;
                case 'complete':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 523.25;
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 1.6);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    const startExercise = (exercise) => {
        if (isPlaying) return;

        clearAllTimers();
        setActiveExercise(exercise);
        setIsPlaying(true);
        setCycles(1);
        setPhase('');
        setCounter(0);

        const cycleDuration = exercise.phases.reduce((total, phase) => total + phase.duration, 0);
        const totalTime = cycleDuration * exercise.totalCycles;
        setTotalDuration(totalTime);
        setElapsedTime(0);
        
        runExercise(exercise, 0, 0);

        phaseTimerRef.current = setInterval(() => {
            setElapsedTime(prev => {
                if (prev >= totalTime) {
                    clearInterval(phaseTimerRef.current);
                    return totalTime;
                }
                return prev + 0.1;
            });
        }, 100);
    };

    const runExercise = (exercise, cycleIndex, phaseIndex) => {
        if (!exercise || !exercise.phases || exercise.phases.length === 0) {
            console.error("Invalid exercise data");
            stopExercise();
            return;
        }
        
        if (cycleIndex >= exercise.totalCycles) {
            clearAllTimers();
            setIsPlaying(false);
            setCycles(exercise.totalCycles);
            setPhase('Complete!');
            setCounter(0);
            playSound('complete');
            return;
        }

        const currentPhase = exercise.phases[phaseIndex];
        setPhase(currentPhase.name);
        setCounter(currentPhase.duration);
        setCycles(cycleIndex + 1);
        playSound(currentPhase.name.toLowerCase());

        let timeRemaining = currentPhase.duration;
        
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }
        
        countdownIntervalRef.current = setInterval(() => {
            timeRemaining -= 1;
            setCounter(timeRemaining);
            
            if (timeRemaining <= 0) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
                
                let nextPhaseIndex = phaseIndex + 1;
                let nextCycleIndex = cycleIndex;
                
                if (nextPhaseIndex >= exercise.phases.length) {
                    nextPhaseIndex = 0;
                    nextCycleIndex += 1;
                }
                
                timerRef.current = setTimeout(() => {
                    if (isPlaying) {
                        runExercise(exercise, nextCycleIndex, nextPhaseIndex);
                    }
                }, 300);
            }
        }, 1000);
    };

    const stopExercise = () => {
        clearAllTimers();
        setIsPlaying(false);
        setActiveExercise(null);
        setCounter(0);
        setPhase('');
        setCycles(0);
        setElapsedTime(0);
        setProgress(0);
    };

    const filteredExercises = selectedCategory === 'all' 
        ? exercises 
        : exercises.filter(ex => ex.category === selectedCategory);

    const progressPercentage = totalDuration > 0 
        ? Math.min((elapsedTime / totalDuration) * 100, 100) 
        : 0;

    return (
        <div className="breathing-exercises">
            <h2>
                <span className="breathing-title-icon">🧘</span> 
                Breathing Exercises
            </h2>
            
            {activeExercise ? (
                <div className={`active-exercise ${activeExercise.animationType}`} style={{
                    background: `linear-gradient(135deg, ${activeExercise.color}20, ${activeExercise.color}05)`,
                    borderLeft: `4px solid ${activeExercise.color}`
                }}>
                    <h3>{activeExercise.title}</h3>
                    
                    <div className="breathing-animation-container">
                        {activeExercise.animationType === 'alternate' ? (
                            <div className="breathing-circle alternate">
                                <div className="nostril-guide">
                                    <div className="face-silhouette"></div>
                                    <div className={`nostril left ${phase.includes('Left') ? 'active' : ''}`}></div>
                                    <div className={`nostril right ${phase.includes('Right') ? 'active' : ''}`}></div>
                                </div>
                            </div>
                        ) : activeExercise.animationType === 'sphere' ? (
                            <div className={`breathing-sphere ${phase.toLowerCase()}`}>
                                <div className="sphere-inner">
                                    <div className="counter">{counter}</div>
                                </div>
                                <div className="sphere-ripple"></div>
                            </div>
                        ) : (
                            <div 
                                className={`breathing-circle ${activeExercise.animationType} ${phase.toLowerCase()}`} 
                                style={{borderColor: activeExercise.color}}
                            >
                                <div className="counter">{counter}</div>
                                <div className="breathing-particles-container">
                                    {Array(8).fill(0).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`breathing-particle ${phase.toLowerCase()}`}
                                            style={{
                                                animationDelay: `${i * 0.2}s`,
                                                transform: `rotate(${i * 45}deg)`,
                                                background: activeExercise.color
                                            }}
                                        ></div>
                                    ))}
                                </div>
                                <div className="breath-status">{phase}</div>
                            </div>
                        )}
                    </div>
                    
                    <div className="exercise-info">
                        {activeExercise.phases.map((p, index) => (
                            <div 
                                key={index} 
                                className={`phase-instruction ${phase === p.name ? 'active' : ''}`}
                                style={{
                                    borderColor: phase === p.name ? activeExercise.color : 'transparent',
                                    backgroundColor: phase === p.name ? `${activeExercise.color}15` : 'transparent'
                                }}
                            >
                                <h4>{p.name} ({p.duration}s)</h4>
                                <p>{p.instruction}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{
                                    width: `${progressPercentage}%`,
                                    backgroundColor: activeExercise.color
                                }}
                            ></div>
                        </div>
                        <div className="progress-info">
                            <span>Cycle {cycles}/{activeExercise.totalCycles}</span>
                            <span className="time-remaining">
                                {Math.floor((totalDuration - elapsedTime) / 60)}:
                                {String(Math.floor((totalDuration - elapsedTime) % 60)).padStart(2, '0')} remaining
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={stopExercise} 
                        className="stop-button"
                        style={{
                            backgroundColor: activeExercise.color
                        }}
                    >
                        Stop Exercise
                    </button>
                </div>
            ) : (
                <>
                    <p className="breathing-intro">
                        Breathing exercises can help reduce stress, improve focus, and promote relaxation.
                        Select a category to find exercises for your specific needs.
                    </p>
                    
                    <div className="category-filter">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                    
                    <div className="exercises-list">
                        {filteredExercises.map(exercise => (
                            <div key={exercise.id} className={`exercise-card theme-${currentTheme}`}>
                                <div className="exercise-header">
                                    <div className="exercise-icon" style={{backgroundColor: `${exercise.color}30`}}>
                                        <span>{exercise.icon}</span>
                                    </div>
                                    <h3>{exercise.title}</h3>
                                </div>
                                
                                <div className="exercise-meta">
                                    <span className="duration-tag">
                                        {exercise.phases.reduce((total, phase) => total + phase.duration, 0) * exercise.totalCycles} seconds
                                    </span>
                                    <span className="category-tag" style={{backgroundColor: `${exercise.color}30`, color: exercise.color}}>
                                        {categories.find(c => c.id === exercise.category)?.name.split(' ')[0]}
                                    </span>
                                </div>
                                
                                <p>{exercise.description}</p>
                                
                                <div className="exercise-benefits">
                                    <div className="benefit-title">Benefits:</div>
                                    <ul>
                                        {exercise.benefits.slice(0, 2).map((benefit, idx) => (
                                            <li key={idx}>{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <button 
                                    onClick={() => startExercise(exercise)} 
                                    className="start-button"
                                    style={{backgroundColor: exercise.color}}
                                >
                                    Start Exercise
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="breathing-footer">
                        <h3>Benefits of Regular Breathing Practice</h3>
                        <div className="benefits-grid">
                            <div className="benefit-item">
                                <div className="benefit-icon">🧠</div>
                                <h4>Mental Clarity</h4>
                                <p>Improves focus, concentration and mental performance</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">😌</div>
                                <h4>Stress Reduction</h4>
                                <p>Activates the parasympathetic nervous system to reduce stress</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">❤️</div>
                                <h4>Heart Health</h4>
                                <p>Lowers blood pressure and improves heart rate variability</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">💤</div>
                                <h4>Better Sleep</h4>
                                <p>Calms the mind and prepares the body for restful sleep</p>
                            </div>
                        </div>
                        <div className="breathing-disclaimer">
                            <strong>Note:</strong> If you feel dizzy or uncomfortable during any exercise, stop and return to normal breathing.
                            These exercises complement but do not replace professional medical care.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BreathingExercises;