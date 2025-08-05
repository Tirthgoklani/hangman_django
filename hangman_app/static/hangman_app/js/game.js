// --- Game State Variables ---
let currentWord = "";
let guessedLetters = [];
let incorrectGuesses = 0;
const maxIncorrectGuesses = 5;

let selectedDifficulty = 'easy';
let selectedCategory = 'random';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const selectionScreen = document.getElementById('selectionScreen');
    const gameScreen = document.getElementById('gameScreen');
    const difficultySelect = document.getElementById('difficulty');
    const categorySelect = document.getElementById('category');
    const startGameBtn = document.getElementById('startGameBtn');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    const wordDisplay = document.getElementById('wordDisplay');
    const keyboard = document.getElementById('keyboard');
    const messageDisplay = document.getElementById('message');
    const newGameBtn = document.getElementById('newGameBtn');
    const newWordBtn = document.getElementById('newWordBtn');
    const remainingChancesDisplay = document.getElementById('remainingChances');

    // --- Start Game Button ---
    startGameBtn.addEventListener('click', () => {
        selectedDifficulty = difficultySelect.value;
        selectedCategory = categorySelect.value;
        selectionScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        startGame(selectedDifficulty, selectedCategory);

        messageDisplay.textContent = '';
        // newGameBtn.style.display = 'none';
        // newWordBtn.style.display = 'none';
        updateRemainingChances();
    });

    // --- Start Game Function (merged) ---
    function startGame(difficulty, category) {
        fetch(`/get_random_word/?difficulty=${difficulty}&category=${category}`)
            .then(response => response.json())
            .then(data => {
                currentWord = data.word.toLowerCase();
                guessedLetters = [];
                incorrectGuesses = 0;

                updateWordDisplay();
                drawHangman();
                createKeyboard();
                updateRemainingChances();
            })
            .catch(error => {
                console.error("Error fetching word:", error);
                wordDisplay.textContent = '⚠️ Error loading word';
            });
    }

    // --- Update Word Display (merged) ---
    function updateWordDisplay() {
        wordDisplay.innerHTML = "";
        for (let letter of currentWord) {
            const span = document.createElement("span");
            span.classList.add("letter");

            span.textContent = guessedLetters.includes(letter) ? letter : "_";
            wordDisplay.appendChild(span);
        }
    }

    // --- Create On-Screen Keyboard ---
    function createKeyboard() {
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
    function handleGuess(letter) {
        if (!guessedLetters.includes(letter)) {
            guessedLetters.push(letter);

            if (!currentWord.includes(letter)) {
                incorrectGuesses++;
                drawHangman();
            }

            updateWordDisplay();
            updateKeyboardState();
            updateRemainingChances();
            checkGameStatus();
        }
    }

    // --- Update Keyboard State ---
    function updateKeyboardState() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const letter = key.textContent.toLowerCase();
            key.disabled = guessedLetters.includes(letter);
            key.classList.toggle('correct', currentWord.includes(letter));
            key.classList.toggle('wrong', !currentWord.includes(letter));
        });
    }

    // --- Check Win/Lose Condition ---
    function checkGameStatus() {
        const allGuessed = currentWord.split('').every(letter => guessedLetters.includes(letter));
        if (allGuessed) {
            messageDisplay.textContent = '🎉 You won!';
            disableKeyboard();
            newGameBtn.style.display = 'inline-block';
            newWordBtn.style.display = 'inline-block';
        } else if (incorrectGuesses >= maxIncorrectGuesses) {
            messageDisplay.textContent = `💀 You lost! Word was: ${currentWord.toUpperCase()}`;
            disableKeyboard();
            newGameBtn.style.display = 'inline-block';
            newWordBtn.style.display = 'inline-block';
        }
    }

    // --- Disable Keyboard ---
    function disableKeyboard() {
        document.querySelectorAll('.key').forEach(key => key.disabled = true);
    }

    // --- Update Remaining Chances ---
    function updateRemainingChances() {
        remainingChancesDisplay.textContent = `Remaining Chances: ${maxIncorrectGuesses - incorrectGuesses}`;
    }

    // --- Draw Hangman ---
    function drawHangman() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#334155';

        ctx.beginPath();
        ctx.moveTo(10, 240);
        ctx.lineTo(190, 240);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(50, 240);
        ctx.lineTo(50, 20);
        ctx.lineTo(140, 20);
        ctx.lineTo(140, 40);
        ctx.stroke();

        if (incorrectGuesses > 0) {
            ctx.beginPath();
            ctx.arc(140, 60, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (incorrectGuesses > 1) {
            ctx.beginPath();
            ctx.moveTo(140, 80);
            ctx.lineTo(140, 140);
            ctx.stroke();
        }
        if (incorrectGuesses > 2) {
            ctx.beginPath();
            ctx.moveTo(140, 100);
            ctx.lineTo(110, 120);
            ctx.stroke();
        }
        if (incorrectGuesses > 3) {
            ctx.beginPath();
            ctx.moveTo(140, 100);
            ctx.lineTo(170, 120);
            ctx.stroke();
        }
        if (incorrectGuesses > 4) {
            ctx.beginPath();
            ctx.moveTo(140, 140);
            ctx.lineTo(110, 180);
            ctx.moveTo(140, 140);
            ctx.lineTo(170, 180);
            ctx.stroke();
        }
    }

    // --- New Game ---
    newGameBtn.addEventListener('click', () => {
        location.reload();
    });

    // --- New Word ---
    newWordBtn.addEventListener('click', () => {
        startGame(selectedDifficulty, selectedCategory);
    });
});
