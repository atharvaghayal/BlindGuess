import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css'; 

const API_BASE_URL = 'http://localhost:8000/api/wordle';

const redirectToRules = () => {
    window.location.href = '/rules.html';
};

const ThemeButton = ({ theme, toggleTheme }) => {
    const icon = theme === 'dark' ? '☀️' : '🌙'; 
    return (
        <div className="theme-icon" onClick={toggleTheme}>
            {icon}
        </div>
    );
};

const BitTitle = ({ text }) => {
    const processedText = text.split('');
    const coloredCharacters = processedText.map((char, index) => {
        if (char === ' ' && index === 5) {
            return <span key={index} className="word-separator">&nbsp;</span>;
        }
        return <span key={index} className="bit-char">{char}</span>;
    });
    return (<h1 className="title-bitcount">{coloredCharacters}</h1>);
};

const Tile = ({ letter, status }) => {
    const className = `tile ${status || 'empty'}`; 
    return (<div className={className}>{letter}</div>);
};

const Row = ({ guess, solutionStatus }) => {
    const tiles = Array.from({ length: 5 }, (_, i) => ({
        letter: guess[i] || '',
        status: solutionStatus ? solutionStatus[i] : (guess[i] ? 'typing' : 'empty')
    }));

    return (
        <div className="row">
            {tiles.map((tile, index) => (
                <Tile key={index} letter={tile.letter} status={tile.status} />
            ))}
        </div>
    );
};

const StatsModal = ({ stats, onClose, resetTime, formatTime, answerWord, isWin }) => {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const isLoggedIn = stats.is_logged_in;

    if (!isLoggedIn) {
        stats.times_played = 1;
        stats.streak = isWin ? 1 : 0;
        stats.max_streak = isWin ? 1 : 0;
        stats.win_percentage = isWin ? 100.00 : 0.00;
    }

    const streakDisplay = stats.streak === 1 ? '1*' : stats.streak.toString();
    const maxStreakDisplay = stats.max_streak === 1 ? '1*' : stats.max_streak.toString();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="stats-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                
                <h2>{isWin ? '🥳 CONGRATULATIONS! 🥳' : 'GAME OVER'}</h2>
                
                {!isWin && (
                    <div className="answer-reveal">
                        The word was: <span className="actual-answer">{answerWord}</span>
                    </div>
                )}

                <div className="stats-row">
                    <div className="stat-item">
                        <div className="stat-label">Played</div>
                        <div className="stat-value">{stats.times_played}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Streak</div>
                        <div className="stat-value">{streakDisplay}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Max Streak</div>
                        <div className="stat-value">{maxStreakDisplay}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Win %</div>
                        <div className="stat-value">{stats.win_percentage.toFixed(2)}%</div>
                    </div>
                </div>

                {!isLoggedIn && (
                    <p className="login-prompt">
                        “If you want to save your scores and appear at the top of the leaderboard, then sign up or log in.”
                    </p>
                )}
                
                <div className="countdown-section">
                    <p>Next Quickle game will be available in</p>
                    <div className="countdown-timer">{formatTime(resetTime)}</div>
                </div>

                <div className="footer-credit">
                    Quickle-Word Game | Built with ❤️ by Atharva Ghayal
                </div>

            </div>
        </div>
    );
};


// Main App component
function App() {
    const MAX_GUESSES = 6;
    const WORD_LENGTH = 5;

    // --- State Management ---
    const [theme, setTheme] = useState('dark');
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [solvedStatuses, setSolvedStatuses] = useState([]); 
    const [gameState, setGameState] = useState('playing');
    const [score, setScore] = useState(0); 
    const [systemWord, setSystemWord] = useState('');
    
    // 6th Guess Timer State
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef(null);

    // Modal State
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [resetTime, setResetTime] = useState(null);
    
    
    // --- Initial Word Fetch (UNCHANGED) ---
    const fetchSystemWord = useCallback(async () => {
        try {
            const wordResponse = await axios.get('http://localhost:8000/api/wordle/daily-word');
            setSystemWord(wordResponse.data.word || "QUICK"); 
        } catch (error) {
            console.error("Error fetching daily word:", error);
            setSystemWord("QUICK"); // Fallback word
        }
    }, []);

    useEffect(() => {
        fetchSystemWord();
    }, [fetchSystemWord]);


    // --- Theme Logic (UNCHANGED) ---
    const toggleTheme = () => {
        setTheme(current => (current === 'dark' ? 'light' : 'dark'));
    };

    // Apply theme class to the body tag
    useEffect(() => {
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);


    // --- Game Reset Time (UNCHANGED) ---
    const fetchResetTime = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/wordle/next-reset`);
            setResetTime(response.data.time_remaining_seconds);
        } catch (error) {
            console.error("Error fetching reset time:", error);
            setResetTime(3600); 
        }
    }, []);

    useEffect(() => {
        fetchResetTime();
        const resetInterval = setInterval(() => {
            setResetTime(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(resetInterval);
    }, [fetchResetTime]);


    // --- Scoring Logic (UNCHANGED) ---
    const calculateScore = useCallback((guessNumber, timeSeconds) => {
        if (guessNumber <= 5) {
            const pointsMap = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 6 };
            return pointsMap[guessNumber] || 0;
        } 
        if (guessNumber === 6) {
            if (timeSeconds <= 5) return 5;
            if (timeSeconds <= 9) return 3;
            if (timeSeconds <= 12) return 1;
            return 0;
        }
        return 0;
    }, []);

    // --- Statistics Modal Display (UNCHANGED) ---
    const showStatistics = useCallback(async (finalScore, isWin) => {
        const userId = 0; 
        try {
            const response = await axios.get(`http://localhost:8000/api/user/stats?user_id=${userId}`);
            
            setStatsData(response.data);
            setIsStatsModalOpen(true);
        } catch (error) {
            console.error("Error fetching user stats:", error);
            setStatsData({
                times_played: 1, 
                streak: isWin ? 1 : 0, 
                max_streak: isWin ? 1 : 0, 
                win_percentage: isWin ? 100.00 : 0.00, 
                is_logged_in: false
            });
            setIsStatsModalOpen(true);
        }
    }, []);

    // --- 6th Guess Timer Logic (UNCHANGED) ---
    useEffect(() => {
        if (isTimerActive) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev >= 12) {
                        clearInterval(timerRef.current);
                        setIsTimerActive(false);
                        return 12;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isTimerActive]);

    // --- Game Submission Logic (UNCHANGED) ---
    const submitGuess = useCallback(async () => {
        const guessNumber = guesses.length + 1;
        const guessWord = currentGuess;
        
        try {
            const response = await axios.post(`http://localhost:8000/api/wordle/guess`, { guess: guessWord });
            const { status_array, is_correct } = response.data;
            
            setGuesses((prev) => [...prev, guessWord]);
            setSolvedStatuses((prev) => [...prev, status_array]);
            setCurrentGuess('');
            
            if (is_correct) {
                const finalScore = score + calculateScore(guessNumber, timerSeconds);
                setScore(finalScore);
                setGameState('won');
                setIsTimerActive(false);
                showStatistics(finalScore, true);
            
            } else if (guessNumber === MAX_GUESSES) {
                const penaltyAmount = 5;
                const finalScore = score - penaltyAmount; 
                setScore(finalScore);
                setGameState('lost');
                setIsTimerActive(false);
                showStatistics(finalScore, false);
            
            } else if (guessNumber === MAX_GUESSES - 1) {
                setIsTimerActive(true);
                setTimerSeconds(0);
            }
        } catch (error) {
            console.error("Error verifying guess:", error);
        }
    }, [currentGuess, guesses.length, MAX_GUESSES, timerSeconds, score, calculateScore, showStatistics]);

    // --- Keyboard Input Handler (UNCHANGED) ---
    const handleKeyDown = useCallback((event) => {
        if (gameState !== 'playing' || isStatsModalOpen) return;
        
        const key = event.key;

        if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
            setCurrentGuess((prev) => prev + key.toUpperCase());
            return;
        }
        
        if (key === 'Backspace') {
            setCurrentGuess((prev) => prev.slice(0, -1));
            return;
        }

        if (key === 'Enter' && currentGuess.length === WORD_LENGTH) {
            submitGuess();
        }
    }, [currentGuess, WORD_LENGTH, submitGuess, gameState, isStatsModalOpen]);

    // Attach keyboard listener (UNCHANGED)
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // Create 6 rows for the board (UNCHANGED)
    const boardRows = Array.from({ length: MAX_GUESSES }, (_, index) => {
        const status = solvedStatuses[index];
        if (index < guesses.length) {
            return ( <Row key={index} guess={guesses[index]} solutionStatus={status}/> );
        } else if (index === guesses.length) {
            return ( <Row key={index} guess={currentGuess} isCurrentGuess={true}/> );
        } else {
            return <Row key={index} guess="" />;
        }
    });

    // Formatting countdown timer (UNCHANGED)
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="App">
            
            <div className="help-icon" onClick={redirectToRules}>?</div>
            
            <ThemeButton theme={theme} toggleTheme={toggleTheme} />

            {/* --- REPLACED PROFILE ICON with Signup/Login BUTTON --- */}
            <button 
                className="login-btn" 
                onClick={() => console.log("Signup/Login button clicked (Non-functional)")}
            >
                Signup/Login
            </button>
            {/* -------------------------------------------------------- */}

            {/* Timer Display for 6th Guess */}
            {isTimerActive && (
                <div className="timer-display">
                    {timerSeconds.toString().padStart(2, '0')}s / 12s
                </div>
            )}
            
            <header className="header">
                <BitTitle text="QUICKLE" />
                <div className="score-display">Score: {score} pts</div>
            </header>
            
            <div className="board">{boardRows}</div>

            {/* Statistics Modal */}
            {isStatsModalOpen && statsData && (
                <StatsModal 
                    stats={statsData} 
                    onClose={() => setIsStatsModalOpen(false)}
                    resetTime={resetTime}
                    formatTime={formatTime}
                    answerWord={systemWord}
                    isWin={gameState === 'won'}
                />
            )}
        </div>
    );
}

export default App;