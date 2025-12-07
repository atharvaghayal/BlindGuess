import React, { useState, useEffect } from 'react';
import './App.css'; 

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


// --- BitTitle Component (UNCHANGED) ---
const BitTitle = ({ text }) => {
    const processedText = text.split('');
    const coloredCharacters = processedText.map((char, index) => {
        if (char === ' ' && index === 5) {
            return <span key={index} className="word-separator">&nbsp;</span>;
        }
        return <span key={index} className="bit-char">{char}</span>;
    });

    return (
        <h1 className="title-bitcount">
            {coloredCharacters}
        </h1>
    );
};


// --- Tile Component ---
const Tile = ({ letter, status }) => {
    // status will eventually be 'correct', 'present', 'absent', or 'empty'
    const className = `tile ${status || 'empty'}`; 
    return (
        <div className={className}>
            {letter}
        </div>
    );
};


// --- Row Component ---
const Row = ({ guess, isCurrentGuess, solutionStatus }) => {
    // Create an array of 5 letters, padding with empty strings
    const tiles = Array.from({ length: 5 }, (_, i) => ({
        letter: guess[i] || '',
        // Use solved status if available, otherwise default to empty for typing rows
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

// Main App component
function App() {
    const MAX_GUESSES = 6;
    const WORD_LENGTH = 5;

    // State for the theme
    const [theme, setTheme] = useState('dark');
    
    // State for the game
    // guesses: Array of submitted words (e.g., ['QUICK', 'APPLE', ...])
    const [guesses, setGuesses] = useState([]);
    // currentGuess: The word being typed on the active row
    const [currentGuess, setCurrentGuess] = useState('');
    // solvedStatuses: Array of status arrays for each submitted guess
    const [solvedStatuses, setSolvedStatuses] = useState([]); 
    
    // Logic to handle theme toggle and apply to body
    const toggleTheme = () => {
        setTheme(current => (current === 'dark' ? 'light' : 'dark'));
    };

    useEffect(() => {
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);


    // --- KEYBOARD INPUT HANDLER ---
    const handleKeyDown = (event) => {
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

        // 3. Handle Enter/Submit (Placeholder Logic)
        if (key === 'Enter' && currentGuess.length === WORD_LENGTH) {
            
            // PREVENTS MULTIPLE SUBMITS ON FAST KEYPRESS
            if (guesses.length >= MAX_GUESSES) return; 

            // *** Backend Simulation Placeholder ***
            console.log(`Submitting guess: ${currentGuess}`);
            
            // --- Logic that will be replaced by API call/backend check ---
            const simulatedStatus = Array(WORD_LENGTH).fill('absent'); 
            if (guesses.length === 0) {
                 // Simulate the fixed 'BLIND' row from the image for visual debugging (Optional)
                 simulatedStatus[0] = 'correct'; simulatedStatus[3] = 'present'; simulatedStatus[4] = 'present'; 
            }
            if (guesses.length === 1) {
                 // Simulate the fixed 'WORDS' row from the image (Optional)
                 simulatedStatus[2] = 'present'; simulatedStatus[3] = 'correct'; 
            }
            // --- End Placeholder Logic ---


            setGuesses((prev) => [...prev, currentGuess]);
            setSolvedStatuses((prev) => [...prev, simulatedStatus]);
            setCurrentGuess('');
            
            // TO DO: Add winning/losing logic here based on backend response
        }
    };

    // Attach keyboard listener to the whole document
    useEffect(() => {
        // Only attach listener if the game hasn't ended
        if (guesses.length < MAX_GUESSES) {
             document.addEventListener('keydown', handleKeyDown);
        }
       
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentGuess, guesses.length]); // Dependencies ensure the handler uses fresh state


    // Create 6 rows for the board
    const boardRows = Array.from({ length: MAX_GUESSES }, (_, index) => {
        if (index < guesses.length) {
            // Submitted guess
            return (
                <Row 
                    key={index} 
                    guess={guesses[index]} 
                    solutionStatus={solvedStatuses[index]}
                />
            );
        } else if (index === guesses.length) {
            // Current typing row
            return (
                <Row 
                    key={index} 
                    guess={currentGuess} 
                    isCurrentGuess={true}
                />
            );
        } else {
            // Empty rows
            return <Row key={index} guess="" />;
        }
    });

    return (
        <div className="App">
            
            <div className="help-icon" onClick={redirectToRules}>
                ?
            </div>
            
            <ThemeButton theme={theme} toggleTheme={toggleTheme} />

            <div className="profile-icon">
                👤
            </div>

            <header className="header">
                <BitTitle text="QUICKLE" />
            </header>
            
            <div className="board">
                {boardRows}
            </div>
        </div>
    );
}

export default App;