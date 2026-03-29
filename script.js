let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let score = 0;
let quizFinished = false;
let isMultiChoice = false;

function parseQuizText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const parsedQuestions = [];
    let currentQ = null;

    for (const line of lines) {
        if (line.startsWith('@Q:')) {
            if (currentQ) {
                parsedQuestions.push(currentQ);
            }
            currentQ = {
                question: line.substring(3).trim(),
                answers: [],
                correctIndices: []
            };
        } else if (line.startsWith('@A*:')) {
            if (currentQ) {
                currentQ.correctIndices.push(currentQ.answers.length);
                currentQ.answers.push(line.substring(4).trim());
            }
        } else if (line.startsWith('@A:')) {
            if (currentQ) {
                currentQ.answers.push(line.substring(3).trim());
            }
        }
    }

    if (currentQ) {
        parsedQuestions.push(currentQ);
    }

    return parsedQuestions;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap
    }
    return array;
}

function randomize(questions) {
    questions.forEach(question => {
        let correctAnswers = question.correctIndices.map(i => question.answers[i]);
        shuffleArray(question.answers);

        question.correctIndices = [];
        for (let i = 0; i < question.answers.length; i++) {
            if (correctAnswers.includes(question.answers[i])) {
                question.correctIndices.push(i);
            }
        }
    });

    shuffleArray(questions);
}

function generateQuiz() {
    const input = document.getElementById('quizInput').value.trim();
    
    if (!input) {
        showError('Please enter quiz text!');
        return;
    }

    try {
        questions = parseQuizText(input);
        
        if (questions.length === 0) {
            showError('No valid questions found. Please check your format!');
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || q.answers.length === 0 || q.correctIndices.length === 0) {
                showError(`Question ${i + 1} is incomplete. Make sure it has a question, answers, and a correct answer marked with @A*:`);
                return;
            }
        }

        randomize(questions);

        hideError();
        startQuiz();
    } catch (error) {
        showError('Error parsing quiz text. Please check your format!');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function showErrorQuiz(message) {
    const errorDiv = document.getElementById('errorMessageQuiz');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideErrorQuiz() {
    document.getElementById('errorMessageQuiz').style.display = 'none';
}

function startQuiz() {
    currentQuestion = 0;
    userAnswers = new Array(questions.length).fill(null).map(() => []);
    score = 0;
    quizFinished = false;

    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('quizSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    displayQuestion();
    updateScore();
}

function displayQuestion() {
    const question = questions[currentQuestion];
    const container = document.getElementById('questionContainer');
    const isMultiChoice = question.correctIndices.length > 1;
    
    let html = `
        <div class="question-card">
            <div class="question-header">
                <div class="question-number">Question ${currentQuestion + 1} of ${questions.length}</div>
                ${isMultiChoice ? '<div class="multi-choice-badge">Select all that apply</div>' : ''}
            </div>
            <div class="question-text">${question.question}</div>
            <div class="answers">
    `;

    question.answers.forEach((answer, index) => {
        const isSelected = userAnswers[currentQuestion].includes(index);
        const isCorrectAnswer = question.correctIndices.includes(index);
        const isIncorrect = quizFinished && isSelected && !isCorrectAnswer;
        const showCorrect = quizFinished && isCorrectAnswer;
        
        let classes = 'answer-option';
        if (isSelected && !quizFinished) classes += ' selected';
        if (showCorrect) classes += ' correct';
        if (isIncorrect) classes += ' incorrect';
        
        html += `
            <div class="${classes}" onclick="selectAnswer(${index})">
                ${answer}
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
    updateNavigation();
}

function selectAnswer(answerIndex) {
    if (quizFinished) return;
    
    const question = questions[currentQuestion];
    const isMultiChoice = question.correctIndices.length > 1;
    
    if (isMultiChoice) {
        // Toggle selection for multi-choice
        const index = userAnswers[currentQuestion].indexOf(answerIndex);
        if (index > -1) {
            userAnswers[currentQuestion].splice(index, 1);
        } else {
            userAnswers[currentQuestion].push(answerIndex);
        }
    } else {
        // Single choice
        userAnswers[currentQuestion] = [answerIndex];
    }
    
    displayQuestion();
    updateScore();
}

function updateScore() {
    score = 0;
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswerIndices = userAnswers[i];
        const correctIndices = question.correctIndices;
        
        // Check if selected answers match correct answers exactly
        if (userAnswerIndices.length === correctIndices.length &&
            userAnswerIndices.sort((a, b) => a - b).every((val, idx) => val === correctIndices.sort((a, b) => a - b)[idx])) {
            score++;
        }
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = currentQuestion === questions.length - 1;
    
    if (currentQuestion === questions.length - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    }
}

function finishQuiz() {
    if (userAnswers.some(ans => ans.length === 0)) {
        showErrorQuiz('Please answer all questions before finishing the quiz!');
        return;
    }

    quizFinished = true;
    
    displayQuestion();
    
    document.getElementById('quizSection').style.display = 'none';
    showResults();
}

function showResults() {
    const percentage = Math.round((score / questions.length) * 100);
    document.getElementById('finalScore').textContent = `${percentage}%`;
    
    let message = '';
    if (percentage >= 90) {
        message = 'Excellent! You\'ve mastered this topic.';
    } else if (percentage >= 70) {
        message = 'Great job! You have a good understanding.';
    } else if (percentage >= 50) {
        message = 'Not bad! Review the material and try again.';
    } else {
        message = 'Keep studying! Practice makes perfect.';
    }
    
    message += `<br><br>You got ${score} out of ${questions.length} questions correct.`;
    
    document.getElementById('scoreMessage').innerHTML = message;
    
    generateDetailedReview();
    
    document.getElementById('resultsSection').style.display = 'block';
}

function generateDetailedReview() {
    let reviewHtml = '<div class="detailed-review"><h3>Review</h3>';
    
    questions.forEach((question, qIndex) => {
        const userAnswerIndices = userAnswers[qIndex];
        const correctIndices = question.correctIndices;
        const isCorrect = userAnswerIndices.length === correctIndices.length &&
            userAnswerIndices.sort((a, b) => a - b).every((val, idx) => val === correctIndices.sort((a, b) => a - b)[idx]);
        
        reviewHtml += `
            <div class="review-question ${!isCorrect ? 'has-error' : ''}">
                <div class="review-header">
                    <span class="review-question-number">Question ${qIndex + 1}</span>
                    <span class="review-status ${isCorrect ? 'correct' : 'incorrect'}">
                        ${isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                </div>
                <div class="review-question-text">${question.question}</div>
                <div class="review-answers">
        `;
        
        question.answers.forEach((answer, aIndex) => {
            const isUserAnswer = userAnswerIndices.includes(aIndex);
            const isCorrectAnswer = correctIndices.includes(aIndex);
            
            let answerClass = 'review-answer';
            let answerLabel = '';
            
            if (isCorrectAnswer) {
                answerClass += ' review-correct';
                answerLabel = 'Correct';
            }
            
            if (isUserAnswer && !isCorrectAnswer) {
                answerClass += ' review-user-wrong';
                answerLabel = 'Your Answer';
            }
            
            if (isUserAnswer && isCorrectAnswer) {
                answerLabel = 'Your Answer';
            }
            
            reviewHtml += `
                <div class="${answerClass}">
                    <span class="answer-text">${answer}</span>
                    ${answerLabel ? `<span class="answer-label">${answerLabel}</span>` : ''}
                </div>
            `;
        });
        
        reviewHtml += '</div></div>';
    });
    
    reviewHtml += '</div>';
    
    const resultsSection = document.getElementById('resultsSection');
    const existingReview = resultsSection.querySelector('.detailed-review');
    if (existingReview) {
        existingReview.remove();
    }
    
    const buttonsDiv = resultsSection.querySelector('.button-group');
    buttonsDiv.insertAdjacentHTML('beforebegin', reviewHtml);
}

function restartQuiz() {
    hideError();
    hideErrorQuiz();
    const existingReview = document.querySelector('.detailed-review');
    if (existingReview) {
        existingReview.remove();
    }
    
    startQuiz();
}

function newQuiz() {
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    const existingReview = document.querySelector('.detailed-review');
    if (existingReview) {
        existingReview.remove();
    }
    document.getElementById('quizInput').value = '';
    hideError();
    hideErrorQuiz();
}