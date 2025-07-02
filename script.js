let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let score = 0;
let quizFinished = false;

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
                correctIndex: -1
            };
        } else if (line.startsWith('@A*:')) {
            if (currentQ) {
                currentQ.correctIndex = currentQ.answers.length;
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
        let correctAnswer = question.answers[question.correctIndex];
        shuffleArray(question.answers);

        for (let i = 0; i < question.answers.length; i++) {
            if (question.answers[i] === correctAnswer) {
                question.correctIndex = i;
                break;
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
            if (!q.question || q.answers.length === 0 || q.correctIndex === -1) {
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
    userAnswers = new Array(questions.length).fill(-1);
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
    
    let html = `
        <div class="question-card">
            <div class="question-header">
                <div class="question-number">Question ${currentQuestion + 1} of ${questions.length}</div>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="answers">
    `;

    question.answers.forEach((answer, index) => {
        const isSelected = userAnswers[currentQuestion] === index;
        const isCorrect = index === question.correctIndex;
        const isIncorrect = quizFinished && isSelected && !isCorrect;
        const showCorrect = quizFinished && isCorrect;
        
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
    
    userAnswers[currentQuestion] = answerIndex;
    displayQuestion();
    updateScore();
}

function updateScore() {
    score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].correctIndex) {
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
    if (userAnswers.includes(-1)) {
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
        const userAnswer = userAnswers[qIndex];
        const correctAnswer = question.correctIndex;
        const isCorrect = userAnswer === correctAnswer;
        
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
            const isUserAnswer = userAnswer === aIndex;
            const isCorrectAnswer = correctAnswer === aIndex;
            
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