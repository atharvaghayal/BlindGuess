import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css'; 

const API_BASE_URL = 'http://localhost:8000/api/wordle';

// --- Redirection Handler (UNCHANGED) ---
const redirectToRules = () => {
    window.location.href = '/rules.html';
};


// --- Theme Button Component (UNCHANGED) ---
const ThemeButton = ({ theme, toggleTheme }) => {
    const icon = theme === 'dark' ? '☀️' : '🌙'; 
    return (
        <div className="theme-icon" onClick={toggleTheme}>
            {icon}
        </div>
    );
};


// --- BitTitle, Tile, and Row Components (UNCHANGED) ---
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


// --- Stats Modal Component (MODIFIED) ---
const StatsModal = ({ stats, onClose, resetTime, formatTime, answerWord, isWin }) => {
    // Escape key handler for closing modal
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const isLoggedIn = stats.is_logged_in;

    // --- ANONYMOUS FIRST-TIME STATS LOGIC ---
    // If not logged in and first game, overwrite stats for visual fidelity
    if (!isLoggedIn) {
        // Since we cannot rely on the backend for anonymous data, we simulate it
        // based on the result of the current game (Played 1, Win 1 or Win 0)
        stats.times_played = 1;
        stats.streak = isWin ? 1 : 0;
        stats.max_streak = isWin ? 1 : 0;
        stats.win_percentage = isWin ? 100.00 : 0.00;
    }

    // Format streak display (as per user request: 1*)
    const streakDisplay = stats.streak === 1 ? '1*' : stats.streak.toString();
    const maxStreakDisplay = stats.max_streak === 1 ? '1*' : stats.max_streak.toString();
    // ----------------------------------------

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="stats-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                
                <h2>{isWin ? '🥳 CONGRATULATIONS! 🥳' : 'GAME OVER'}</h2>
                
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
// Main App component
function App() {
    const MAX_GUESSES = 6;
    const WORD_LENGTH = 5;

    // --- State Management ---
    const [theme, setTheme] = useState('dark');
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [solvedStatuses, setSolvedStatuses] = useState([]); 
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [score, setScore] = useState(0); 
    const [systemWord, setSystemWord] = useState(''); // Stores the actual word
    
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
            // Note: Updated the API path for the word itself if needed for display on loss
            const wordResponse = await axios.get('http://localhost:8000/api/wordle/daily-word');
            // Assuming FastAPI returns {word: "QUICK"} or similar for tracking the answer
            setSystemWord(wordResponse.data.word || "QUICK"); 
        } catch (error) {
            console.error("Error fetching daily word:", error);
            setSystemWord("QUICK"); // Fallback word
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


    // --- Game Scoring Logic ---
    const calculateScore = useCallback((guessNumber, timeSeconds) => {
        if (guessNumber <= 5) {
            const pointsMap = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 6 };
            return pointsMap[guessNumber] || 0;
        } 
        
        // 6th Guess Timed Scoring
        if (guessNumber === 6) {
            if (timeSeconds <= 5) return 5;
            if (timeSeconds <= 9) return 3;
            if (timeSeconds <= 12) return 1;
            return 0; // > 12 seconds
        }
        return 0;
    }, []);

    // --- Statistics Modal Display ---
    const showStatistics = useCallback(async (finalScore, isWin) => {
        // userId = 0 is a placeholder for anonymous users in the backend logic
        const userId = 0; 
        try {
            const response = await axios.get(`http://localhost:8000/api/user/stats?user_id=${userId}`);
            
            // Pass statistics data from the backend
            setStatsData(response.data);
            setIsStatsModalOpen(true);
        } catch (error) {
            console.error("Error fetching user stats:", error);
            // Fallback: Simulate anonymous first-time stats upon completion
            setStatsData({
                times_played: 1, 
                streak: isWin ? 1 : 0, 
                max_streak: isWin ? 1 : 0, 
                win_percentage: isWin ? 100.00 : 0.00, 
                is_logged_in: false // Assume anonymous if stats fail
            });
            setIsStatsModalOpen(true);
        }
    }, []);


    // --- 6th Guess Timer Logic ---
    useEffect(() => {
        if (isTimerActive) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(prev => {
                    // Stop timer at 12 seconds
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


    // --- Game Submission Logic (Backend Interaction) ---
    const submitGuess = useCallback(async () => {
        const guessNumber = guesses.length + 1;
        const guessWord = currentGuess;
        
        // Add loading state/check here if desired to prevent double submit
        
        try {
            // Send the guess to the backend for verification
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
                // Penalty applies even if score is 0, making it -5
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
            console.error("Error verifying guess:", error);
            // TODO: Add frontend error feedback for invalid/non-meaningful words
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
            // Submitted guess
            return ( <Row key={index} guess={guesses[index]} solutionStatus={status}/> );
        } else if (index === guesses.length) {
            // Current typing row
            return ( <Row key={index} guess={currentGuess} isCurrentGuess={true}/> );
        } else {
            // Empty rows
            return <Row key={index} guess="" />;
        }
    });

    // Formatting countdown timer for the modal
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

            <div className="profile-icon">👤</div>

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
                    answerWord={systemWord} // Passed for display on loss
                    isWin={gameState === 'won'} // Passed to determine modal content
                />
            )}
        </div>
    );
}

export default App;