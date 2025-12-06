import React from 'react';
import './App.css'; 

// --- BitTitle Component for the Header Text (SIMPLIFIED FOR WHITE COLOR) ---
const BitTitle = ({ text }) => {
  // Split the text into individual characters and map them
  const coloredCharacters = text.split('').map((char, index) => {
    // Apply the class for styling, but no random color class
    // We use a general class 'bit-char' which will be styled white in CSS
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

// Helper component for a single tile/box (remains the same)
const Tile = ({ letter, status }) => {
  const className = `tile ${status}`;
  return (
    <div className={className}>
      {letter}
    </div>
  );
};

// Helper component for a row (remains the same)
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
      <header className="header">
        <BitTitle text="BLIND WORDLE" />
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