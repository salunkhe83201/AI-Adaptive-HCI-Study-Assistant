const questions = [
    {
        question: "What does CPU stand for?",
        choices: [
            "Central Processing Unit",
            "Computer Personal Utility",
            "Central Program User",
            "Control Processing Utility"
        ],
        correct: "Central Processing Unit",
        difficulty: "beginner"
    },
    {
        question: "Which language is used to structure a web page?",
        choices: ["HTML", "CSS", "SQL", "Python"],
        correct: "HTML",
        difficulty: "beginner"
    },
    {
        question: "Which CSS property changes text color?",
        choices: ["color", "font-style", "background", "display"],
        correct: "color",
        difficulty: "beginner"
    },
    {
        question: "Which JavaScript method selects an element by ID?",
        choices: [
            "document.getElementById()",
            "document.createElement()",
            "document.write()",
            "document.getAttribute()"
        ],
        correct: "document.getElementById()",
        difficulty: "intermediate"
    },
    {
        question: "Which array method adds an item to the end of an array?",
        choices: ["push()", "pop()", "shift()", "slice()"],
        correct: "push()",
        difficulty: "intermediate"
    },
    {
        question: "Which browser feature stores key-value pairs across sessions?",
        choices: [
            "localStorage",
            "console",
            "alert",
            "document.title"
        ],
        correct: "localStorage",
        difficulty: "intermediate"
    },
    {
        question: "Which method converts a JavaScript object into JSON text?",
        choices: [
            "JSON.stringify()",
            "JSON.parse()",
            "Object.keys()",
            "Array.from()"
        ],
        correct: "JSON.stringify()",
        difficulty: "advanced"
    },
    {
        question: "What is the purpose of event.preventDefault()?",
        choices: [
            "Prevent the browser's default event behavior",
            "Delete an event listener",
            "Stop JavaScript permanently",
            "Refresh the page"
        ],
        correct: "Prevent the browser's default event behavior",
        difficulty: "advanced"
    },
    {
        question: "Which technique can reduce rapid switching between adaptive states?",
        choices: [
            "Using minimum evidence and threshold margins",
            "Removing all user history",
            "Changing difficulty after every click",
            "Using only one question"
        ],
        correct: "Using minimum evidence and threshold margins",
        difficulty: "advanced"
    }
];

let currentLevel = "beginner";
let score = 0;
let attempts = 0;
let recentResponses = [];
let currentQuestion = null;
let answerSubmitted = false;

const levelDisplay = document.getElementById("level-display");
const scoreDisplay = document.getElementById("score-display");
const attemptsDisplay = document.getElementById("attempts-display");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const feedbackMessage = document.getElementById("feedback-message");
const adaptationMessage = document.getElementById("adaptation-message");
const nextButton = document.getElementById("next-button");
const resetButton = document.getElementById("reset-button");

function saveState() {
    localStorage.setItem("adaptiveStudyUser", JSON.stringify({
        currentLevel,
        score,
        attempts,
        recentResponses
    }));
}

function loadState() {
    const savedState = localStorage.getItem("adaptiveStudyUser");

    if (!savedState) {
        return;
    }

    try {
        const userState = JSON.parse(savedState);
        currentLevel = userState.currentLevel || "beginner";
        score = userState.score || 0;
        attempts = userState.attempts || 0;
        recentResponses = userState.recentResponses || [];
    } catch (error) {
        localStorage.removeItem("adaptiveStudyUser");
    }
}

function calculateRecentAccuracy() {
    if (recentResponses.length === 0) {
        return 0;
    }

    const correctResponses = recentResponses.filter(
        response => response === true
    ).length;

    return correctResponses / recentResponses.length;
}

function updateAdaptiveLevel() {
    if (recentResponses.length < 3) {
        adaptationMessage.textContent =
            "Complete at least three questions before the system changes the difficulty.";
        return;
    }

    const accuracy = calculateRecentAccuracy();
    const previousLevel = currentLevel;

    if (accuracy >= 0.80) {
        currentLevel = "advanced";
    } else if (accuracy >= 0.50) {
        currentLevel = "intermediate";
    } else {
        currentLevel = "beginner";
    }

    const accuracyPercentage = Math.round(accuracy * 100);

    if (currentLevel !== previousLevel) {
        adaptationMessage.textContent =
            `Difficulty changed from ${capitalize(previousLevel)} ` +
            `to ${capitalize(currentLevel)} because your recent ` +
            `accuracy is ${accuracyPercentage}%.`;
    } else {
        adaptationMessage.textContent =
            `Difficulty remains ${capitalize(currentLevel)} because ` +
            `your recent accuracy is ${accuracyPercentage}%.`;
    }
}

function selectQuestion() {
    const availableQuestions = questions.filter(
        item => item.difficulty === currentLevel
    );
    const randomIndex = Math.floor(
        Math.random() * availableQuestions.length
    );

    return availableQuestions[randomIndex];
}

function displayQuestion() {
    answerSubmitted = false;
    nextButton.disabled = true;
    feedbackMessage.textContent = "";

    currentQuestion = selectQuestion();
    questionText.textContent = currentQuestion.question;
    answerButtons.innerHTML = "";

    currentQuestion.choices.forEach(choice => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice;
        button.className = "answer-button";
        button.addEventListener("click", () => {
            checkAnswer(choice, button);
        });
        answerButtons.appendChild(button);
    });

    updateStatusDisplay();
}

function checkAnswer(selectedAnswer, selectedButton) {
    if (answerSubmitted) {
        return;
    }

    answerSubmitted = true;
    attempts++;

    const isCorrect = selectedAnswer === currentQuestion.correct;

    if (isCorrect) {
        score++;
        selectedButton.classList.add("correct");
        feedbackMessage.textContent = "Correct answer.";
    } else {
        selectedButton.classList.add("incorrect");
        feedbackMessage.textContent =
            `Incorrect. The correct answer is: ${currentQuestion.correct}`;
        highlightCorrectAnswer();
    }

    recentResponses.push(isCorrect);

    if (recentResponses.length > 5) {
        recentResponses.shift();
    }

    disableAnswerButtons();
    updateAdaptiveLevel();
    updateStatusDisplay();
    saveState();
    nextButton.disabled = false;
}

function highlightCorrectAnswer() {
    const buttons = answerButtons.querySelectorAll(".answer-button");

    buttons.forEach(button => {
        if (button.textContent === currentQuestion.correct) {
            button.classList.add("correct");
        }
    });
}

function disableAnswerButtons() {
    const buttons = answerButtons.querySelectorAll(".answer-button");

    buttons.forEach(button => {
        button.disabled = true;
    });
}

function updateStatusDisplay() {
    levelDisplay.textContent = capitalize(currentLevel);
    scoreDisplay.textContent = score;
    attemptsDisplay.textContent = attempts;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function resetProgress() {
    const userConfirmed = window.confirm(
        "Do you want to clear all saved progress?"
    );

    if (!userConfirmed) {
        return;
    }

    currentLevel = "beginner";
    score = 0;
    attempts = 0;
    recentResponses = [];
    localStorage.removeItem("adaptiveStudyUser");
    adaptationMessage.textContent =
        "Progress was reset. The system has returned to Beginner.";
    displayQuestion();
}

nextButton.addEventListener("click", displayQuestion);
resetButton.addEventListener("click", resetProgress);

loadState();
updateStatusDisplay();
displayQuestion();