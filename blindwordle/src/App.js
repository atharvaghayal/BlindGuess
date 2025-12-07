import React from 'react';
import './App.css'; 

// --- BitTitle Component (UNCHANGED logic) ---
const BitTitle = ({ text }) => {
  // We process the text to find the space between words, but QUICKLE has no space.
  const processedText = text.split('');

  const coloredCharacters = processedText.map((char, index) => {
    // This space check is kept, but it will not trigger for "QUICKLE"
    if (char === ' ' && index === 5) {
      return (
        <span key={index} className="word-separator">
          &nbsp;
        </span>
      );
    }

    // All other letters
    return (
      <span key={index} className="bit-char">
        {char}
      </span>
    );
  });

  return (
    <h1 className="title-bitcount">
      {coloredCharacters}
    </h1>
  );
};

// --- Tile and Row Components (UNCHANGED) ---
const Tile = ({ letter, status }) => {
  const className = `tile ${status}`;
  return (
    <div className={className}>
      {letter}
    </div>
  );
};

const Row = ({ guess }) => {
  // Hardcoded data matching the image: "BLIND" and "WORDS" for styling
  
  const tilesData = guess.split('').map((letter, index) => {
    let status = 'absent'; // Default gray
    
    // Custom overrides to exactly match the image for the first row "BLIND"
    if (guess === "BLIND") {
        if (index === 0) status = 'correct'; // B - Green
        if (index === 1) status = 'absent';  // L - Gray
        if (index === 2) status = 'absent';  // I - Gray
        if (index === 3) status = 'present'; // N - Yellow
        if (index === 4) status = 'present'; // D - Yellow
    }
    
    // Custom overrides to exactly match the image for the second row "WORDS"
    if (guess === "WORDS") {
        if (index === 0) status = 'absent';  // W - Gray
        if (index === 1) status = 'absent';  // O - Gray
        if (index === 2) status = 'present'; // R - Yellow
        if (index === 3) status = 'correct'; // D - Green
        if (index === 4) status = 'absent';  // S - Gray
    }
    
    return { letter, status };
  });

  // For empty rows, create 'empty' tiles
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
  const allGuesses = [
    'BLIND', 
    'WORDS', 
    '', 
    '', 
    '', 
    '', 
  ];

  return (
    <div className="App">
      
      {/* --- HELP ICON ELEMENT --- */}
      <div className="help-icon" onClick={redirectToRules}>
        ?
      </div>

      <header className="header">
        {/* --- TITLE CHANGE HERE --- */}
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

// NOTE: redirectToRules must be defined globally or imported if not in this file, 
// based on your previous final version. Assuming it is defined,
// or we can define it simply here for completeness:

const redirectToRules = () => {
    window.location.href = '/rules.html';
};


export default App;