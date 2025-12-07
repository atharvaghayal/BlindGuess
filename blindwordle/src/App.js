import React, { useState, useEffect } from 'react';
import './App.css'; 

// --- Redirection Handler (UNCHANGED) ---
const redirectToRules = () => {
    window.location.href = '/rules.html';
};


// --- Theme Button Component (UNCHANGED) ---
const ThemeButton = ({ theme, toggleTheme }) => {
    // Determine the icon based on the current theme
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

    return (
        <h1 className="title-bitcount">
            {coloredCharacters}
        </h1>
    );
};

const Tile = ({ letter, status }) => {
    const className = `tile ${status}`;
    return (
        <div className={className}>
            {letter}
        </div>
    );
};

const Row = ({ guess }) => {
    const tilesData = guess.split('').map((letter, index) => {
        let status = 'absent';
        if (guess === "BLIND") {
            if (index === 0) status = 'correct'; 
            if (index === 1) status = 'absent';
            if (index === 2) status = 'absent';
            if (index === 3) status = 'present';
            if (index === 4) status = 'present';
        }
        if (guess === "WORDS") {
            if (index === 0) status = 'absent';
            if (index === 1) status = 'absent';
            if (index === 2) status = 'present'; 
            if (index === 3) status = 'correct'; 
            if (index === 4) status = 'absent';
        }
        return { letter, status };
    });
    const emptyCount = 5 - guess.length;
    for (let i = 0; i < emptyCount; i++) {
        tilesData.push({ letter: '', status: 'empty' });
    }
    return (
        <div className="row">
            {tilesData.map((tile, index) => (
                <Tile key={index} letter={tile.letter} status={tile.status} />
            ))}
        </div>
    );
};

// Main App component
function App() {
    const [theme, setTheme] = useState('dark');

    const toggleTheme = () => {
        setTheme(current => (current === 'dark' ? 'light' : 'dark'));
    };

    // --- KEY CHANGE: Apply theme class to the body tag ---
    useEffect(() => {
        // Remove existing theme classes
        document.body.classList.remove('dark-theme', 'light-theme');
        // Add the new theme class
        document.body.classList.add(`${theme}-theme`);
    }, [theme]); // Reruns whenever the 'theme' state changes
    // ----------------------------------------------------


    const allGuesses = [
        'BLIND', 'WORDS', '', '', '', '',
    ];

    return (
        // The .App div no longer needs the theme class, but we keep it clean.
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
                {allGuesses.map((guess, index) => (
                    <Row key={index} guess={guess} />
                ))}
            </div>
        </div>
    );
}

export default App;