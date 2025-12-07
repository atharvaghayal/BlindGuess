from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
import json

app = FastAPI()

# --- CORS Configuration ---
# Allows your React app (running on http://localhost:3000) to communicate with FastAPI
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global Game State & Word List (Replace with database in production) ---
WORD_LIST = ["QUICK", "LEAVE", "TRAIN", "APPLE", "HOUSE", "POINT", "MONTH", "BUILD", "DREAM"] # Add thousands of 5-letter words
TODAY_WORD = ""
GAME_DATE = datetime.now().date()
USED_WORDS = set()

def get_daily_word():
    """Selects a new word if the day changes, ensuring it hasn't been used."""
    global GAME_DATE, TODAY_WORD, USED_WORDS

    current_date = datetime.now().date()
    if current_date != GAME_DATE or not TODAY_WORD:
        # Reset if a new day has started
        GAME_DATE = current_date
        
        available_words = list(set(WORD_LIST) - USED_WORDS)
        if not available_words:
            # Optionally reset USED_WORDS or handle exhaustion
            USED_WORDS.clear() 
            available_words = WORD_LIST
        
        TODAY_WORD = random.choice(available_words)
        USED_WORDS.add(TODAY_WORD)
        print(f"New Daily Word: {TODAY_WORD}")
    
    return TODAY_WORD

# --- Game Logic Core ---
def compare_guess(guess: str, target: str):
    """Compares guess against target word and returns an array of statuses."""
    target_letters = list(target.upper())
    guess_letters = list(guess.upper())
    
    # Initialize statuses: 0=Grey/Absent, 1=Yellow/Present, 2=Green/Correct
    statuses = [0] * 5
    
    # 1. Check for Green (Exact Match)
    for i in range(5):
        if guess_letters[i] == target_letters[i]:
            statuses[i] = 2
            target_letters[i] = None # Mark as used
            guess_letters[i] = None # Mark as used
            
    # 2. Check for Yellow (Present in wrong spot)
    for i in range(5):
        if guess_letters[i] is not None:
            try:
                # Find index of the guessed letter in the remaining target letters
                j = target_letters.index(guess_letters[i])
                statuses[i] = 1
                target_letters[j] = None # Mark the target letter as used
            except ValueError:
                # Letter not found (Grey/Absent: status remains 0)
                pass
                
    # Convert numerical status back to string labels for frontend
    status_map = {0: "absent", 1: "present", 2: "correct"}
    return [status_map[s] for s in statuses]


# --- API Endpoints ---
@app.get("/api/wordle/daily-word")
async def get_word():
    """Initial endpoint to get the game status and word length."""
    get_daily_word()
    return {"word_length": 5, "max_guesses": 6}

@app.post("/api/wordle/guess")
async def verify_guess(guess_data: dict):
    """Endpoint to verify a user's guess and return the status array."""
    guess = guess_data.get("guess")
    if not guess or len(guess) != 5:
        raise HTTPException(status_code=400, detail="Invalid guess length.")

    target = get_daily_word()
    
    status_array = compare_guess(guess, target)
    
    is_correct = all(s == 'correct' for s in status_array)
    
    return {
        "status_array": status_array,
        "is_correct": is_correct,
    }

@app.get("/api/wordle/next-reset")
async def get_reset_time():
    """Calculates the time until the next midnight (IST)."""
    now = datetime.now()
    # Assuming IST for the server (UTC + 5:30)
    midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    time_remaining_seconds = (midnight - now).total_seconds()
    
    return {"time_remaining_seconds": int(time_remaining_seconds)}

# --- Placeholder for User Statistics (Replace with database interaction) ---
@app.get("/api/user/stats")
async def get_user_stats(user_id: int = None):
    # This is placeholder data. In a real app, this would query a database.
    stats = {
        "times_played": 15,
        "streak": 5,
        "max_streak": 8,
        "win_percentage": 60.00,
        "is_logged_in": user_id is not None # Logic to check login status
    }
    return stats