const WORDS = [
  "ABOUT", "OTHER", "WHICH", "THEIR", "THERE", "FIRST", "WOULD", "THESE", "CLICK", "PRICE",
  "STATE", "EMAIL", "WORLD", "MUSIC", "AFTER", "VIDEO", "WHERE", "BOOKS", "LINKS", "YEARS",
  "ORDER", "ITEMS", "GROUP", "UNDER", "GAMES", "COULD", "GREAT", "HOTEL", "STORE", "TERMS",
  "RIGHT", "LOCAL", "THOSE", "USING", "PHONE", "FORUM", "BASED", "BLACK", "CHECK", "INDEX",
  "BEING", "WOMEN", "TODAY", "SOUTH", "PAGES", "FOUND", "HOUSE", "PHOTO", "POWER", "WHILE",
  "THREE", "TOTAL", "PLACE", "THINK", "NORTH", "POSTS", "MEDIA", "WATER", "SINCE", "GUIDE",
  "BOARD", "WHITE", "SMALL", "TIMES", "SITES", "LEVEL", "HOURS", "IMAGE", "TITLE", "SHALL",
  "CLASS", "STILL", "MONEY", "EVERY", "VISIT", "TOOLS", "REPLY", "VALUE", "PRESS", "LEARN",
  "PRINT", "STOCK", "POINT", "SALES", "LARGE", "TABLE", "START", "MODEL", "HUMAN", "MOVIE",
  "MARCH", "YAHOO", "GOING", "STUDY", "STAFF", "AGAIN", "APRIL", "NEVER", "USERS", "TOPIC",
  "BELOW", "PARTY", "LOGIN", "LEGAL", "ABOVE", "QUOTE", "STORY", "RATES", "YOUNG", "FIELD",
  "PAPER", "GIRLS", "NIGHT", "TEXAS", "POKER", "ISSUE", "RANGE", "COURT", "AUDIO", "LIGHT",
  "WRITE", "OFFER", "GIVEN", "FILES", "EVENT", "CHINA", "NEEDS", "MIGHT", "MONTH", "MAJOR",
  "AREAS", "SPACE", "CARDS", "CHILD", "ENTER", "SHARE", "ADDED", "RADIO", "UNTIL", "COLOR",
  "TRACK", "LEAST", "TRADE", "DAVID", "GREEN", "CLOSE", "DRIVE", "SHORT", "MEANS", "DAILY",
  "BEACH", "COSTS", "STYLE", "FRONT", "PARTS", "EARLY", "MILES", "SOUND", "WORKS", "RULES",
  "FINAL", "ADULT", "THING", "CHEAP", "THIRD", "GIFTS", "COVER", "OFTEN", "WATCH", "DEALS",
  "WORDS", "LINUX", "JAMES", "HEART", "ERROR", "CLEAR", "MAKES", "INDIA", "TAKEN", "KNOWN",
  "CASES", "QUICK", "WHOLE", "LATER", "BASIC", "SHOWS", "ALONG", "AMONG", "DEATH", "SPEED",
  "BRAND", "STUFF", "JAPAN", "DOING", "LOANS", "SHOES", "ENTRY", "NOTES", "FORCE", "RIVER",
  "ALBUM", "VIEWS", "PLANS", "BUILD", "TYPES", "LINES", "APPLY", "ASKED", "CROSS", "WEEKS",
  "LOWER", "UNION", "NAMES", "LEAVE", "TEENS", "WOMAN", "CABLE", "SCORE", "SHOWN", "FLASH",
  "IDEAS", "ALLOW", "HOMES", "SUPER", "ASIAN", "CAUSE", "FOCUS", "ROOMS", "VOICE", "COMES",
  "ADIEU", "ARISE", "SOARE", "STARE", "GHOST", "CHESS", "HORSE", "BLANK", "FRIED", "FLINT",
  "MINTY", "SLATE", "CRANE", "TRACE", "DEALT", "TARES", "ROAST", "ROATE","ABACK", "ABASE", 
  "ABATE", "ABBOT", "ABHOR", "ABIDE", "ABODE", "ABUSE", "ABYSS", "ACORN","ACRID", "ACTOR",
  "ACUTE", "ADAPT", "ADEPT", "ADMIN", "ADMIT", "ADOPT", "ADORE", "ADORN","AFFIX", "AGILE", 
  "AGING", "AGONY", "AGREE", "AHEAD", "AISLE", "ALBUM", "ALERT", "ALIEN","ALIGN", "ALOFT", 
  "ALOUD", "ALTAR", "AMBER", "AMBLE", "AMEND", "AMISS", "AMUSE", "ANGEL","ANGER", "ANGLE", 
  "ANGRY", "ANNEX", "ANNUL", "ANODE", "ANTIC", "ANVIL", "ARCHY", "AREST","ARGUE", "ARMOR", 
  "AROMA", "ARROW", "ARTSY", "ASCOT", "ASKEW", "ASSAY", "ASTIR", "ATONE","AUDIO", "AVOID",
  "AWAKE", "AWARD", "AWARE", "AZURE", "BADGE", "BALMY", "BANJO", "BARON","BASAL", "BASIL", 
  "BASIN", "BATCH", "BATHE", "BATON", "BATTY", "BEACH", "BEADY", "BEARD","BEAST", "BEEFY",
  "BEFIT", "BEGAN", "BEGIN", "BELCH", "BELIE", "BENCH", "BERET", "BERRY","BIRTH", "BISON",
  "BLIND", "BLINK", "BLISS", "BLITZ", "BLOOM", "BLUNT", "BLURB", "BLUSH","BOAST", "BONEY",
  "BOOST", "BOOTH", "BOOTY", "BOOST", "BRACE", "BRAID", "BRAND", "BRAVE","BREAD", "BREAK",
  "BREED", "BRIEF", "BRING", "BROTH", "BROWN", "BRUSH", "BUDDY", "BUNCH","BURST", "CABIN",
  "CABLE", "CARRY", "CATCH", "CHAIN", "CHAIR", "CHASE", "CHEEK", "CHIEF","CIVIL", "CLAIM",
  "CLASP", "CLEAN", "CLIMB", "CLOCK", "CLOUD", "COACH", "COAST", "COUCH","TWIRL", "YOUTH" ,
  "CRACK", "CRAVE", "CRUSH", "DAUNT", "DEPTH", "DIRTY", "DOZEN", "DRAFT", "DREAM", "DRESS",
  "DRINK", "DROVE", "DWELL", "EAGER", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENJOY", "EXTRA",
  "FAITH", "FALSE", "FAULT", "FIBER", "FIFTH", "FIGHT", "FINAL", "FLASH", "FLEET", "FLOOR",
  "FLUID", "FRONT", "FRONT", "FRIDA", "FUNNY", "FRESH", "FRUIT", "GUEST", "GUIDE", "GIANT",
  "GRACE", "GRADE", "GRANT", "GRASS", "GROSS", "GUARD", "GUEST", "lIVES", "HAUNT", "HASTY",
  "HUNGR", "HUMID", "HUMOR", "ICILY", "INEPT", "INERT", "IRATE", "IVORY", "JADED", "JAZZY",
  "JOUST", "JUMPY", "KNACK", "KNAVE", "KNEAD", "KNOTS", "LANKY", "LATCH", "LURID", "MIRTH",
  "MOWER", "MUGGY", "NAIVE", "NERVE", "NIFTY", "NUDGE", "OLIVE", "ONSET", "OOMPH", "OUCHE",
  "PINCH", "RAZOR", "QUAIL", "QUAKE", "QUELL", "QUILL", "QUIRK", "RUDDY", "RUNIC", "SABLE",
  "TONIC","TRYST" , "JOLLY", "MOODY", "PAINT", "PATCH", "SPICY", "SWIRL", "ACIDS", "ACTING"
];
const answer = words[Math.floor(Math.random() * words.length)];
let currentRow = 0;
let currentCol = 0;
let guesses = Array.from({ length: 6 }, () => Array(5).fill(""));
let gameOver = false;
let timerStarted = false;
let timeLeft = 60;
let timerInterval;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const timer = document.getElementById("timer");
const timeDisplay = document.getElementById("time");

// Create board
for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < 5; j++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        row.appendChild(tile);
    }
    board.appendChild(row);
}

// Create keyboard
const keys = [
    ..."QWERTYUIOP".split(""),
    ..."ASDFGHJKL".split(""),
    "Enter", ..."ZXCVBNM".split(""), "Del"
];

keys.forEach(k => {
    const keyBtn = document.createElement("button");
    keyBtn.textContent = k;
    keyBtn.classList.add("key");
    keyBtn.addEventListener("click", () => handleKey(k));
    keyboard.appendChild(keyBtn);
});

function handleKey(key) {
    if (gameOver) return;

    if (key === "Enter") {
        if (currentCol === 5) submitGuess();
    } else if (key === "Del") {
        if (currentCol > 0) {
            currentCol--;
            guesses[currentRow][currentCol] = "";
            updateBoard();
        }
    } else if (/^[A-Z]$/.test(key) && currentCol < 5) {
        guesses[currentRow][currentCol] = key;
        currentCol++;
        updateBoard();
    }
}

function updateBoard() {
    const rowTiles = board.children[currentRow].children;
    for (let i = 0; i < 5; i++) {
        rowTiles[i].textContent = guesses[currentRow][i];
    }
}

function submitGuess() {
    const guessWord = guesses[currentRow].join("").toLowerCase();
    if (guessWord.length !== 5) return;

    if (currentRow < 5) {
        currentRow++;
        currentCol = 0;
    }

    if (currentRow === 5 && !timerStarted) {
        startTimer();
    }

    if (currentRow === 6) {
        revealColors();
        checkWin(guessWord);
    }
}

function revealColors() {
    for (let r = 0; r < 6; r++) {
        const rowTiles = board.children[r].children;
        const guessWord = guesses[r].join("").toLowerCase();
        for (let i = 0; i < 5; i++) {
            if (guessWord[i] === answer[i]) {
                rowTiles[i].classList.add("correct");
            } else if (answer.includes(guessWord[i])) {
                rowTiles[i].classList.add("present");
            } else {
                rowTiles[i].classList.add("absent");
            }
        }
    }
}

function startTimer() {
    timer.classList.remove("hidden");
    timerStarted = true;
    timeLeft = 60;
    timeDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false, "⏳ Time's up! You lost!");
        }
    }, 1000);
}

function checkWin(guessWord) {
    clearInterval(timerInterval);
    if (guessWord === answer) {
        endGame(true, "🎉 You Win!");
    } else {
        endGame(false, `❌ You lost! Word was "${answer.toUpperCase()}"`);
    }
}

function endGame(win, msg) {
    gameOver = true;
    message.textContent = msg;
    message.classList.remove("hidden");
}