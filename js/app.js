// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const examScreen = document.getElementById('exam-screen');
const resultsScreen = document.getElementById('results-screen');
const set1Btn = document.getElementById('set1-btn');
const set2Btn = document.getElementById('set2-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionNumber = document.getElementById('question-number');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress');
const questionList = document.getElementById('question-list');
const submitExamBtn = document.getElementById('submit-exam');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const passFailElement = document.getElementById('pass-fail');
const reviewQuestionsElement = document.getElementById('review-questions');
const restartBtn = document.getElementById('restart-btn');

// Global variables
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let examStartTime;
let timerInterval;
let examDuration = 90 * 60; // 90 minutes in seconds
let questionSetName = '';

// Event Listeners
set1Btn.addEventListener('click', () => startExam('questionSet1'));
set2Btn.addEventListener('click', () => startExam('questionSet2'));
prevBtn.addEventListener('click', showPreviousQuestion);
nextBtn.addEventListener('click', showNextQuestion);
submitExamBtn.addEventListener('click', submitExam);
restartBtn.addEventListener('click', restartExam);

// Functions
async function startExam(setName) {
    questionSetName = setName;
    try {
        // Log for debugging
        console.log(`Attempting to fetch: data/${setName}.json`);
        
        // Use XMLHttpRequest instead of fetch for better error reporting
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `data/${setName}.json`, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    questions = JSON.parse(xhr.responseText);
                    console.log(`Successfully loaded ${questions.length} questions`);
                    
                    // Limit to 60 questions if more are available
                    if (questions.length > 60) {
                        questions = questions.slice(0, 60);
                    }
                    
                    // Initialize user answers
                    userAnswers = Array(questions.length).fill(null);
                    
                    // Start timer
                    startTimer();
                    
                    // Show exam screen
                    welcomeScreen.classList.add('hidden');
                    examScreen.classList.remove('hidden');
                    
                    // Create question navigation
                    createQuestionNav();
                    
                    // Show first question
                    showQuestion(0);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    alert('Failed to parse question data. Please check the console for details.');
                }
            } else {
                console.error('Failed to load questions. Status:', xhr.status);
                alert(`Failed to load questions. Status: ${xhr.status}. Please check the console for details.`);
            }
        };
        
        xhr.onerror = function() {
            console.error('Network error when trying to fetch questions');
            alert('Network error when trying to fetch questions. Are you opening the file directly? Try using a local server.');
        };
        
        xhr.send();
    } catch (error) {
        console.error('Error in startExam:', error);
        alert('Failed to load questions. Please check the console for details.');
    }
}

function showQuestion(index) {
    const question = questions[index];
    questionText.textContent = question.question;
    
    // Update question number
    questionNumber.textContent = `Question ${index + 1} of ${questions.length}`;
    
    // Clear options
    optionsContainer.innerHTML = '';
    
    // Add options
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = `${String.fromCharCode(65 + i)}. ${option}`;
        
        // Check if this option is selected
        if (userAnswers[index] === i) {
            optionElement.classList.add('selected');
        }
        
        optionElement.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            optionElement.classList.add('selected');
            
            // Save user answer
            userAnswers[index] = i;
            
            // Update question navigation
            updateQuestionNav();
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Update navigation buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === questions.length - 1;
    
    // Update progress bar
    const progress = ((index + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Update current question in navigation
    updateQuestionNav();
    
    // Update current index
    currentQuestionIndex = index;
}

function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

function showNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

function createQuestionNav() {
    questionList.innerHTML = '';
    
    for (let i = 0; i < questions.length; i++) {
        const questionBtn = document.createElement('div');
        questionBtn.classList.add('question-number');
        questionBtn.textContent = i + 1;
        
        questionBtn.addEventListener('click', () => {
            showQuestion(i);
        });
        
        questionList.appendChild(questionBtn);
    }
}

function updateQuestionNav() {
    const questionBtns = document.querySelectorAll('.question-number');
    
    questionBtns.forEach((btn, i) => {
        // Remove all classes first
        btn.classList.remove('current', 'answered');
        
        // Add current class if this is the current question
        if (i === currentQuestionIndex) {
            btn.classList.add('current');
        }
        
        // Add answered class if this question has been answered
        if (userAnswers[i] !== null) {
            btn.classList.add('answered');
        }
    });
}

function startTimer() {
    examStartTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - examStartTime) / 1000);
        const remainingSeconds = examDuration - elapsedSeconds;
        
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            submitExam();
            return;
        }
        
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        
        timerElement.textContent = `Time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function submitExam() {
    // Stop timer
    clearInterval(timerInterval);
    
    // Calculate score
    let correctAnswers = 0;
    
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].correctAnswer) {
            correctAnswers++;
        }
    }
    
    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 66; // KCNA passing score is 66%
    
    // Display results
    scoreElement.textContent = `You scored ${correctAnswers} out of ${questions.length} (${Math.round(score)}%)`;
    passFailElement.textContent = passed ? 'PASSED!' : 'FAILED';
    passFailElement.className = passed ? 'pass' : 'fail';
    
    // Generate review
    generateReview();
    
    // Show results screen
    examScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
}

function generateReview() {
    reviewQuestionsElement.innerHTML = '';
    
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = userAnswers[i];
        const isCorrect = userAnswer === question.correctAnswer;
        
        const reviewQuestion = document.createElement('div');
        reviewQuestion.classList.add('review-question');
        
        // Question text
        const questionHeader = document.createElement('h4');
        questionHeader.textContent = `Question ${i + 1}: ${question.question}`;
        reviewQuestion.appendChild(questionHeader);
        
        // Options
        const reviewOptions = document.createElement('div');
        reviewOptions.classList.add('review-options');
        
        question.options.forEach((option, j) => {
            const reviewOption = document.createElement('div');
            reviewOption.classList.add('review-option');
            reviewOption.textContent = `${String.fromCharCode(65 + j)}. ${option}`;
            
            if (j === question.correctAnswer) {
                reviewOption.classList.add('correct');
            } else if (j === userAnswer && j !== question.correctAnswer) {
                reviewOption.classList.add('incorrect');
            }
            
            reviewOptions.appendChild(reviewOption);
        });
        
        reviewQuestion.appendChild(reviewOptions);
        
        // Explanation
        const explanation = document.createElement('div');
        explanation.classList.add('explanation');
        explanation.textContent = question.explanation;
        reviewQuestion.appendChild(explanation);
        
        reviewQuestionsElement.appendChild(reviewQuestion);
    }
}

function restartExam() {
    // Reset global variables
    questions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    
    // Show welcome screen
    resultsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
}

// Handle beforeunload event to warn user before leaving
window.addEventListener('beforeunload', (e) => {
    if (examScreen.classList.contains('hidden')) {
        return;
    }
    
    e.preventDefault();
    e.returnValue = '';
    return '';
});
