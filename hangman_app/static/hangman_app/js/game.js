// --- Game State Variables ---
let guessedLetters = [];
let incorrectGuesses = 0;
let maxIncorrectGuesses = 5;
let selectedDifficulty = 'easy';
let revealedLetters = [];

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const selectionScreen = document.getElementById('selectionScreen');
    const gameScreen = document.getElementById('gameScreen');
    const startGameBtn = document.getElementById('startGameBtn');
    const difficultySelect = document.getElementById('difficulty');
    
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    const wordDisplay = document.getElementById('wordDisplay');
    const keyboard = document.getElementById('keyboard');
    const messageDisplay = document.getElementById('message');
    const newGameBtn = document.getElementById('newGameBtn');
    const newWordBtn = document.getElementById('newWordBtn');
    const remainingChancesDisplay = document.getElementById('remainingChances');
    const categoryHint = document.getElementById('category-hint');

    // --- Start Game Button Event ---
    startGameBtn.addEventListener('click', () => {
        selectedDifficulty = difficultySelect.value;
        
        // Hide selection screen and show game screen
        selectionScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Start the actual game
        startGame(selectedDifficulty);
    });

    // --- Start Game ---
    function startGame(difficulty) {
        console.log('Starting game with difficulty:', difficulty);
        
        fetch(`/start_game/?difficulty=${difficulty}`)
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                
                if (data.error) {
                    console.error('Server error:', data.error);
                    messageDisplay.textContent = '⚠️ ' + data.error;
                    return;
                }
                
                // Reset game state
                guessedLetters = [];
                incorrectGuesses = 0;
                maxIncorrectGuesses = data.max_incorrect || 5;
                revealedLetters = data.revealed || [];
                
                // Update UI
                categoryHint.textContent = `Hint: ${data.category}`;
                messageDisplay.textContent = '';
                
                // Reset button visibility
                newGameBtn.style.display = 'none';
                newWordBtn.style.display = 'none';
                
                updateWordDisplay();
                createKeyboard();
                updateRemainingChances();
                drawHangman();
                
                console.log('Game started successfully!');
            })
            .catch(error => {
                console.error("Error starting game:", error);
                messageDisplay.textContent = '⚠️ Error loading word: ' + error.message;
            });
    }

    // --- Update Word Display ---
    function updateWordDisplay() {
        console.log('Updating word display with:', revealedLetters);
        wordDisplay.innerHTML = "";
        
        if (!revealedLetters || revealedLetters.length === 0) {
            wordDisplay.textContent = "Loading...";
            return;
        }
        
        for (let letter of revealedLetters) {
            const span = document.createElement("span");
            span.classList.add("guessed-letter"); // Changed from "letter" to match CSS
            span.textContent = letter === '_' ? "_" : letter;
            wordDisplay.appendChild(span);
        }
    }

    // --- Create On-Screen Keyboard ---
    function createKeyboard() {
        console.log('Creating keyboard...');
        keyboard.innerHTML = '';
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let letter of letters) {
            const button = document.createElement('button');
            button.textContent = letter;
            button.classList.add('key');
            button.addEventListener('click', (event) => handleGuess(letter.toLowerCase(), event.target));
            keyboard.appendChild(button);
        }
    }

    // --- Handle Letter Guess ---
    function handleGuess(letter, button) {
        console.log('Guessing letter:', letter);
        
        // Prevent multiple clicks on same button
        if (button.disabled) return;
        
        fetch(`/guess_letter/?letter=${letter}`)
            .then(response => {
                console.log('Guess response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Guess response data:', data);
                
                if (data.error) {
                    alert("Error: " + data.error);
                    return;
                }

                // Update game state
                revealedLetters = Array.isArray(data.revealed) ? data.revealed : [];
                guessedLetters = data.guessed_letters || [];
                incorrectGuesses = data.incorrect_guesses || 0;

                // Update UI
                updateWordDisplay();
                updateKeyboardState();
                updateRemainingChances();
                drawHangman();

                // Check win/lose conditions
                if (data.won) {
                    messageDisplay.textContent = '🎉 You won!';
                    messageDisplay.style.color = '#16a34a'; // Green
                    disableKeyboard();
                    showEndGameButtons();
                } else if (data.lost) {
                    messageDisplay.textContent = `💀 You lost! Word was: ${data.original_word.toUpperCase()}`;
                    messageDisplay.style.color = '#dc2626'; // Red
                    disableKeyboard();
                    showEndGameButtons();
                }
            })
            .catch(error => {
                console.error("Error guessing letter:", error);
                messageDisplay.textContent = 'Error processing guess';
            });
    }

    // --- Update Keyboard State ---
    function updateKeyboardState() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const letter = key.textContent.toLowerCase();
            
            if (guessedLetters.includes(letter)) {
                key.disabled = true;
                
                // Check if letter is in the word
                const isCorrect = revealedLetters.some(revealedLetter => 
                    revealedLetter.toLowerCase() === letter && revealedLetter !== '_'
                );
                
                if (isCorrect) {
                    key.style.backgroundColor = '#16a34a'; // Green for correct
                    key.style.color = 'white';
                } else {
                    key.style.backgroundColor = '#dc2626'; // Red for incorrect
                    key.style.color = 'white';
                }
            }
        });
    }

    // --- Disable Keyboard ---
    function disableKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.disabled = true;
        });
    }

    // --- Show End Game Buttons ---
    function showEndGameButtons() {
        newGameBtn.style.display = 'block';
        newWordBtn.style.display = 'block';
    }

    // --- Update Remaining Chances ---
    function updateRemainingChances() {
        const remaining = maxIncorrectGuesses - incorrectGuesses;
        remainingChancesDisplay.textContent = `Remaining Chances: ${remaining}`;
        
        // Change color based on remaining chances
        if (remaining <= 1) {
            remainingChancesDisplay.style.color = '#dc2626'; // Red
        } else if (remaining <= 2) {
            remainingChancesDisplay.style.color = '#ea580c'; // Orange
        } else {
            remainingChancesDisplay.style.color = '#1e293b'; // Default
        }
    }

    // --- Draw Hangman ---
    function drawHangman() {
        if (!ctx) {
            console.error('Canvas context not available');
            return;
        }
        
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#334155';
        ctx.lineCap = 'round';

        // Base
        ctx.beginPath();
        ctx.moveTo(50, 280);
        ctx.lineTo(350, 280);
        ctx.stroke();

        // Stand
        ctx.beginPath();
        ctx.moveTo(100, 280);
        ctx.lineTo(100, 50);
        ctx.lineTo(250, 50);
        ctx.lineTo(250, 80);
        ctx.stroke();

        // Head
        if (incorrectGuesses > 0) {
            ctx.beginPath();
            ctx.arc(250, 110, 30, 0, Math.PI * 2);
            ctx.stroke();
            
            // Eyes
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(240, 105, 3, 0, Math.PI * 2);
            ctx.arc(260, 105, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Body
        if (incorrectGuesses > 1) {
            ctx.beginPath();
            ctx.moveTo(250, 140);
            ctx.lineTo(250, 200);
            ctx.stroke();
        }

        // Left Arm
        if (incorrectGuesses > 2) {
            ctx.beginPath();
            ctx.moveTo(250, 160);
            ctx.lineTo(210, 180);
            ctx.stroke();
        }

        // Right Arm
        if (incorrectGuesses > 3) {
            ctx.beginPath();
            ctx.moveTo(250, 160);
            ctx.lineTo(290, 180);
            ctx.stroke();
        }

        // Left Leg
        if (incorrectGuesses > 4) {
            ctx.beginPath();
            ctx.moveTo(250, 200);
            ctx.lineTo(210, 240);
            ctx.stroke();
        }

        // Right Leg
        if (incorrectGuesses > 5) {
            ctx.beginPath();
            ctx.moveTo(250, 200);
            ctx.lineTo(290, 240);
            ctx.stroke();
        }
    }

    // --- New Game (Back to Selection) ---
    newGameBtn.addEventListener('click', () => {
        // Reset to selection screen
        gameScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
        
        // Reset message color
        messageDisplay.style.color = '#dc2626';
        messageDisplay.textContent = '';
        
        // Reset difficulty to easy
        difficultySelect.value = 'easy';
        selectedDifficulty = 'easy';
    });

    // --- New Word (Same Difficulty) ---
    newWordBtn.addEventListener('click', () => {
        startGame(selectedDifficulty);
    });
});