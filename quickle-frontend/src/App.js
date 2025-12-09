import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css'; 

const API_BASE_URL = 'http://localhost:8000/api/wordle';

// --- Redirection Handler ---
const redirectToRules = () => {
    window.location.href = '/rules.html';
};


// --- Theme Button Component ---
const ThemeButton = ({ theme, toggleTheme }) => {
    const icon = theme === 'dark' ? '☀️' : '🌙'; 
    return (
        <div className="theme-icon" onClick={toggleTheme}>
            {icon}
        </div>
    );
};


// --- BitTitle Component ---
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

// --- Tile Component ---
const Tile = ({ letter, status }) => {
    const className = `tile ${status || 'empty'}`; 
    return (<div className={className}>{letter}</div>);
};

// --- Row Component ---
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


// --- Toast Component for Notifications ---
const Toast = ({ message, type, onClose }) => {
    
    // 1. HOOKS MUST COME FIRST!
    useEffect(() => {
        // Only set the timer if a message is present
        if (message) { 
            const timer = setTimeout(onClose, 2000); 
            return () => clearTimeout(timer);
        }
        // Return nothing if there is no message, but the hook structure remains consistent
        return undefined; 
    }, [message, onClose]);

    // 2. Conditional rendering logic can follow the hooks
    if (!message) return null; 

    return (
        <div className={`toast toast-${type}`}>
            {message}
        </div>
    );
};


// --- Stats Modal Component ---
const StatsModal = ({ stats, onClose, resetTime, formatTime, answerWord, isWin }) => {
    useEffect(() => { // <--- This is likely Line 63
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const isLoggedIn = stats.is_logged_in;

    // --- ANONYMOUS FIRST-TIME STATS LOGIC ---
    if (!isLoggedIn) {
        stats.times_played = 1;
        stats.streak = isWin ? 1 : 0;
        stats.max_streak = isWin ? 1 : 0;
        stats.win_percentage = isWin ? 100.00 : 0.00;
    }

    // Format streak display (1* if streak is exactly 1, 0 otherwise)
    const streakDisplay = stats.streak === 1 ? '1*' : stats.streak.toString();
    const maxStreakDisplay = stats.max_streak === 1 ? '1*' : stats.max_streak.toString();

    const headerText = isWin ? '🥳 CONGRATULATIONS! 🥳' : 'GAME OVER';
    const headerClass = isWin ? 'win-header' : 'loss-header';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="stats-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                
                <h2 className={headerClass}>{headerText}</h2>
                
                {/* Display Answer on Loss */}
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

                {/* Login Prompt (Anonymous Only) */}
                {!isLoggedIn && (
                    <p className="login-prompt">
                        “If you want to save your scores and appear at the top of the leaderboard, then sign up or log in.”
                    </p>
                )}
                
                {/* Next Game Countdown */}
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
    const [toastMessage, setToastMessage] = useState(null); // Toast state
    
    // 6th Guess Timer State
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef(null);

    // Modal State
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [resetTime, setResetTime] = useState(null);
    
    
    // --- Initial Word Fetch ---
    const fetchSystemWord = useCallback(async () => {
        try {
            const wordResponse = await axios.get('http://localhost:8000/api/wordle/daily-word');
            setSystemWord(wordResponse.data.word || "QUICK"); 
        } catch (error) {
            console.error("Error fetching daily word:", error);
            setSystemWord("QUICK"); 
        }
    }, []);

    useEffect(() => {
        fetchSystemWord();
    }, [fetchSystemWord]);


    // --- Theme Logic ---
    const toggleTheme = () => {
        setTheme(current => (current === 'dark' ? 'light' : 'dark'));
    };

    // Apply theme class to the body tag
    useEffect(() => {
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);


    // --- Game Reset Time ---
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


    // --- Game Scoring Logic (FIXED for >= 12 seconds = 0 points) ---
    const calculateScore = useCallback((guessNumber, timeSeconds) => {
        if (guessNumber <= 5) {
            const pointsMap = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 6 };
            return pointsMap[guessNumber] || 0;
        } 
        
        // 6th Guess Timed Scoring
        if (guessNumber === 6) {
            if (timeSeconds <= 5) return 5;
            if (timeSeconds <= 9) return 3;
            // The FIX: Only award 1 point if time is strictly less than 12 seconds
            if (timeSeconds < 12) return 1; 
            
            // 12 seconds or more returns 0 points
            return 0; 
        }
        return 0;
    }, []);

    // --- Statistics Modal Display ---
    const showStatistics = useCallback(async (finalScore, isWin) => {
        const userId = 0; // Anonymous user simulation
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


    // --- 6th Guess Timer Logic ---
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


    // --- Game Submission Logic ---
    const submitGuess = useCallback(async () => {
        const guessNumber = guesses.length + 1;
        const guessWord = currentGuess;
        
        try {
            const response = await axios.post(`http://localhost:8000/api/wordle/guess`, { guess: guessWord });
            const { status_array, is_correct } = response.data;
            
            // 1. Update Game State
            setGuesses((prev) => [...prev, guessWord]);
            setSolvedStatuses((prev) => [...prev, status_array]);
            setCurrentGuess('');
            
            if (is_correct) {
                // WON: Calculate final score and end game
                const finalScore = score + calculateScore(guessNumber, timerSeconds);
                setScore(finalScore);
                setGameState('won');
                setIsTimerActive(false);
                showStatistics(finalScore, true);
            
            } else if (guessNumber === MAX_GUESSES) {
                // LOST: Calculate penalty and end game
                const penaltyAmount = 5;
                const finalScore = score - penaltyAmount; 
                setScore(finalScore);
                setGameState('lost');
                setIsTimerActive(false);
                showStatistics(finalScore, false);
            
            } else if (guessNumber === MAX_GUESSES - 1) {
                // 5th guess submitted, start timer for 6th guess
                setIsTimerActive(true);
                setTimerSeconds(0);
            }
            
        } catch (error) {
            // Handle 422 (Unprocessable Entity) error from FastAPI for invalid words
            if (error.response && error.response.status === 422) {
                setToastMessage("Enter only meaningful 5-letter words.");
            } else {
                console.error("Error verifying guess:", error);
                setToastMessage("An unexpected error occurred.");
            }
        }
    }, [currentGuess, guesses.length, MAX_GUESSES, timerSeconds, score, calculateScore, showStatistics]);


    // --- Keyboard Input Handler ---
    const handleKeyDown = useCallback((event) => {
        if (gameState !== 'playing' || isStatsModalOpen) return;
        
        const key = event.key;

        // 1. Handle Letter Input
        if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
            setCurrentGuess((prev) => prev + key.toUpperCase());
            return;
        }
        
        // 2. Handle Backspace
        if (key === 'Backspace') {
            setCurrentGuess((prev) => prev.slice(0, -1));
            return;
        }

        // 3. Handle Enter/Submit
        if (key === 'Enter' && currentGuess.length === WORD_LENGTH) {
            submitGuess();
        }
    }, [currentGuess, WORD_LENGTH, submitGuess, gameState, isStatsModalOpen]);

    // Attach keyboard listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // Create 6 rows for the board
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

    // Formatting countdown timer
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const redirectToAuth = () => {
        // Redirect to the external HTML file for Signup/Login
        window.location.href = '/auth.html'; 
    };

    return (
        <div className="App">
            
            <div className="help-icon" onClick={redirectToRules}>?</div>
            
            <ThemeButton theme={theme} toggleTheme={toggleTheme} />

            {/* Signup/Login Button (Far right) */}
            <button 
                className="login-btn" 
                onClick={redirectToAuth}
            >
                Signup/Login
            </button>
            
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

            {/* Toast Notification */}
            <Toast 
                message={toastMessage} 
                type="error"
                onClose={() => setToastMessage(null)} 
            />

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