"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
    areAnswersExactMatch,
    calculatePercentage,
    calculateScore,
    getScoreMessageTier,
} from "@/lib/quiz/scoring";
import { parseQuizText, randomizeQuestions } from "@/lib/quiz/parser";
import {
    validateParsedQuestions,
    validateQuestionCount,
    validateQuizInput,
} from "@/lib/quiz/validation";
import { useToast } from "@/components/ToastProvider";
import { QuizQuestion, QuizValidationError } from "@/lib/quiz/types";

type Screen = "input" | "quiz" | "results";
const QUIZ_TOAST_DURATION_MS = 5000;

const EXAMPLE_TEXT = `@Q: What is the capital of France?\n@A: Madrid\n@A: Berlin\n@A*: Paris\n@A: Rome\n\n@Q: Which planets are gas giants?\n@A*: Jupiter\n@A: Earth\n@A: Mars\n@A*: Saturn`;

function formatElapsedTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function QuizApp() {
    const t = useTranslations("quiz");
    const { showToast } = useToast();

    const [screen, setScreen] = useState<Screen>("input");
    const [quizInput, setQuizInput] = useState("");
    const [questionCountInput, setQuestionCountInput] = useState("");
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[][]>([]);
    const [quizFinished, setQuizFinished] = useState(false);
    const [quizStartTimestamp, setQuizStartTimestamp] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [completedElapsedSeconds, setCompletedElapsedSeconds] = useState<number | null>(null);

    const answeredQuestionsCount = useMemo(
        () => userAnswers.filter((answers) => answers.length > 0).length,
        [userAnswers],
    );

    const score = useMemo(() => calculateScore(questions, userAnswers), [questions, userAnswers]);
    const percentage = useMemo(
        () => calculatePercentage(score, questions.length),
        [score, questions.length],
    );

    const scoreTier = getScoreMessageTier(percentage);

    const activeQuestion = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;
    const displayedCompletionTime = completedElapsedSeconds ?? elapsedSeconds;
    const formattedElapsedTime = formatElapsedTime(elapsedSeconds);
    const formattedCompletionTime = formatElapsedTime(displayedCompletionTime);

    useEffect(() => {
        if (screen !== "quiz" || quizFinished || quizStartTimestamp === null) {
            return;
        }

        const updateElapsedSeconds = (): void => {
            const elapsedSinceStart = Math.floor((Date.now() - quizStartTimestamp) / 1000);
            setElapsedSeconds(elapsedSinceStart);
        };

        updateElapsedSeconds();
        const timerId = window.setInterval(updateElapsedSeconds, 1000);

        return () => {
            window.clearInterval(timerId);
        };
    }, [quizFinished, quizStartTimestamp, screen]);

    function showQuizError(message: string): void {
        showToast(message, {
            variant: "error",
            durationMs: QUIZ_TOAST_DURATION_MS,
            placement: "bottom-right",
        });
    }

    function getValidationErrorMessage(error: QuizValidationError): string {
        if (error.code === "empty-input") {
            return t("errors.emptyInput");
        }

        if (error.code === "no-valid-questions") {
            return t("errors.noValidQuestions");
        }

        if (error.code === "invalid-question-count") {
            return t("errors.invalidQuestionCount");
        }

        if (error.code === "question-count-exceeds-available") {
            return t("errors.questionCountExceedsAvailable", {
                available: error.availableQuestions ?? 0,
            });
        }

        return t("errors.incompleteQuestion", {
            questionNumber: error.questionNumber ?? 0,
        });
    }

    function handleGenerateQuiz(): void {
        const inputValidation = validateQuizInput(quizInput);
        if (inputValidation) {
            showQuizError(getValidationErrorMessage(inputValidation));
            return;
        }

        const parsedQuestions = parseQuizText(quizInput);
        const parsedValidation = validateParsedQuestions(parsedQuestions);

        if (parsedValidation) {
            showQuizError(getValidationErrorMessage(parsedValidation));
            return;
        }

        const questionCountValidation = validateQuestionCount(
            questionCountInput,
            parsedQuestions.length,
        );

        if (questionCountValidation) {
            showQuizError(getValidationErrorMessage(questionCountValidation));
            return;
        }

        const selectedQuestionCount =
            questionCountInput.trim().length > 0
                ? Number(questionCountInput.trim())
                : parsedQuestions.length;

        const randomizedQuestions = randomizeQuestions(parsedQuestions).slice(
            0,
            selectedQuestionCount,
        );

        setQuestions(randomizedQuestions);
        setCurrentQuestion(0);
        setUserAnswers(new Array(randomizedQuestions.length).fill(null).map(() => []));
        setQuizFinished(false);
        setQuizStartTimestamp(Date.now());
        setElapsedSeconds(0);
        setCompletedElapsedSeconds(null);
        setScreen("quiz");
    }

    function handleSelectAnswer(answerIndex: number): void {
        if (quizFinished || !activeQuestion) {
            return;
        }

        const isMultiChoice = activeQuestion.correctIndices.length > 1;

        setUserAnswers((currentAnswers) => {
            const nextAnswers = currentAnswers.map((answerSet) => [...answerSet]);

            if (isMultiChoice) {
                const selectedIndex = nextAnswers[currentQuestion].indexOf(answerIndex);

                if (selectedIndex > -1) {
                    nextAnswers[currentQuestion].splice(selectedIndex, 1);
                } else {
                    nextAnswers[currentQuestion].push(answerIndex);
                }
            } else {
                nextAnswers[currentQuestion] = [answerIndex];
            }

            return nextAnswers;
        });
    }

    function handlePreviousQuestion(): void {
        setCurrentQuestion((prev) => Math.max(prev - 1, 0));
    }

    function handleNextQuestion(): void {
        setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
    }

    function handleJumpToQuestion(questionIndex: number): void {
        if (questionIndex < 0 || questionIndex >= questions.length) {
            return;
        }

        setCurrentQuestion(questionIndex);
    }

    function handleFinishQuiz(): void {
        const hasUnansweredQuestion = userAnswers.some((answers) => answers.length === 0);

        if (hasUnansweredQuestion) {
            showQuizError(t("errors.answerAllBeforeFinish"));
            return;
        }

        const finalElapsedSeconds =
            quizStartTimestamp === null
                ? elapsedSeconds
                : Math.floor((Date.now() - quizStartTimestamp) / 1000);

        setElapsedSeconds(finalElapsedSeconds);
        setCompletedElapsedSeconds(finalElapsedSeconds);
        setQuizFinished(true);
        setScreen("results");
    }

    function handleTryAgain(): void {
        setCurrentQuestion(0);
        setUserAnswers(new Array(questions.length).fill(null).map(() => []));
        setQuizFinished(false);
        setQuizStartTimestamp(Date.now());
        setElapsedSeconds(0);
        setCompletedElapsedSeconds(null);
        setScreen("quiz");
    }

    function handleNewQuiz(): void {
        setQuizInput("");
        setQuestionCountInput("");
        setQuestions([]);
        setCurrentQuestion(0);
        setUserAnswers([]);
        setQuizFinished(false);
        setQuizStartTimestamp(null);
        setElapsedSeconds(0);
        setCompletedElapsedSeconds(null);
        setScreen("input");
    }

    return (
        <div className="quiz-wrapper">
            {screen === "input" && (
                <section className="quiz-panel">
                    <h2 className="quiz-panel-title">{t("create.title")}</h2>
                    <p className="quiz-example">{`${t("create.exampleLabel")}\n${EXAMPLE_TEXT}`}</p>

                    <textarea
                        className="quiz-textarea"
                        value={quizInput}
                        onChange={(event) => setQuizInput(event.target.value)}
                        placeholder={t("create.placeholder")}
                    />

                    <div className="quiz-question-count-field">
                        <div className="quiz-question-count-head">
                            <label htmlFor="questionCount" className="quiz-question-count-label">
                                {t("create.questionCountLabel")}
                            </label>
                            <span className="quiz-question-count-badge">
                                {t("create.questionCountOptional")}
                            </span>
                        </div>

                        <div className="quiz-question-count-input-row">
                            <input
                                id="questionCount"
                                className="quiz-question-count-input"
                                type="number"
                                min={1}
                                step={1}
                                value={questionCountInput}
                                onChange={(event) => setQuestionCountInput(event.target.value)}
                                placeholder={t("create.questionCountPlaceholder")}
                            />
                        </div>
                    </div>

                    <button type="button" className="quiz-primary-button" onClick={handleGenerateQuiz}>
                        {t("create.generate")}
                    </button>
                </section>
            )}

            {screen === "quiz" && activeQuestion && (
                <section>
                    <div className="quiz-question-map" aria-label={t("questionNavigator.title")}>
                        <div className="quiz-question-map-header">
                            <p className="quiz-question-map-title">{t("questionNavigator.title")}</p>

                            <div className="quiz-question-map-meta">
                                <p className="quiz-timer-inline">
                                    <span className="quiz-timer-inline-label">{t("timer.elapsed")}</span>
                                    <span className="quiz-timer-inline-value">{formattedElapsedTime}</span>
                                </p>
                            </div>
                        </div>

                        <div className="quiz-question-map-legend">
                            <span className="quiz-question-map-legend-item">
                                <span className="quiz-question-map-dot quiz-question-map-dot-answered" />
                                {t("questionNavigator.answered")}
                            </span>
                            <span className="quiz-question-map-legend-item">
                                <span className="quiz-question-map-dot quiz-question-map-dot-unanswered" />
                                {t("questionNavigator.unanswered")}
                            </span>
                        </div>

                        <div className="quiz-question-map-grid">
                            {questions.map((question, questionIndex) => {
                                const isCurrentQuestion = questionIndex === currentQuestion;
                                const isAnsweredQuestion =
                                    (userAnswers[questionIndex]?.length ?? 0) > 0;

                                const classNames = ["quiz-question-map-button"];

                                if (isAnsweredQuestion) {
                                    classNames.push("quiz-question-map-button-answered");
                                } else {
                                    classNames.push("quiz-question-map-button-unanswered");
                                }

                                if (isCurrentQuestion) {
                                    classNames.push("quiz-question-map-button-current");
                                }

                                return (
                                    <button
                                        key={`${question.question}-${questionIndex}`}
                                        type="button"
                                        className={classNames.join(" ")}
                                        onClick={() => handleJumpToQuestion(questionIndex)}
                                        aria-label={t("questionNavigator.questionAria", {
                                            number: questionIndex + 1,
                                        })}
                                        aria-current={isCurrentQuestion ? "true" : undefined}
                                    >
                                        {questionIndex + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <article className="quiz-question-card">
                        <div className="quiz-question-header">
                            <span className="quiz-badge">
                                {t("question.counter", {
                                    current: currentQuestion + 1,
                                    total: questions.length,
                                })}
                            </span>

                            {activeQuestion.correctIndices.length > 1 && (
                                <span className="quiz-multi-badge">{t("question.multiChoice")}</span>
                            )}
                        </div>

                        <h2 className="quiz-question-text">{activeQuestion.question}</h2>

                        <div className="quiz-answers">
                            {activeQuestion.answers.map((answer, answerIndex) => {
                                const isSelected = userAnswers[currentQuestion]?.includes(answerIndex) ?? false;
                                const isCorrectAnswer = activeQuestion.correctIndices.includes(answerIndex);
                                const isIncorrect = quizFinished && isSelected && !isCorrectAnswer;
                                const showCorrect = quizFinished && isCorrectAnswer;

                                const classNames = ["quiz-answer"];

                                if (isSelected && !quizFinished) {
                                    classNames.push("quiz-answer-selected");
                                }
                                if (showCorrect) {
                                    classNames.push("quiz-answer-correct");
                                }
                                if (isIncorrect) {
                                    classNames.push("quiz-answer-incorrect");
                                }

                                return (
                                    <button
                                        key={`${activeQuestion.question}-${answer}`}
                                        type="button"
                                        className={classNames.join(" ")}
                                        onClick={() => handleSelectAnswer(answerIndex)}
                                    >
                                        {answer}
                                    </button>
                                );
                            })}
                        </div>
                    </article>

                    <div className="quiz-controls">
                        <div className="quiz-navigation">
                            <button
                                type="button"
                                className="quiz-secondary-button"
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestion === 0}
                            >
                                {t("controls.previous")}
                            </button>

                            {!isLastQuestion && (
                                <button
                                    type="button"
                                    className="quiz-secondary-button"
                                    onClick={handleNextQuestion}
                                >
                                    {t("controls.next")}
                                </button>
                            )}

                            {isLastQuestion && (
                                <button
                                    type="button"
                                    className="quiz-primary-button"
                                    onClick={handleFinishQuiz}
                                >
                                    {t("controls.finish")}
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {screen === "results" && (
                <section className="quiz-results">
                    <div className="quiz-final-score">{`${percentage}%`}</div>
                    <p className="quiz-score-message">{t(`results.${scoreTier}`)}</p>
                    <p className="quiz-score-summary">
                        {t("results.scoreSummary", {
                            score,
                            total: questions.length,
                        })}
                    </p>
                    <p className="quiz-time-summary">
                        <span className="quiz-time-summary-label">{t("timer.completionLabel")}</span>{" "}
                        <span className="quiz-time-summary-value">{formattedCompletionTime}</span>
                    </p>

                    {questions.map((question, questionIndex) => {
                        const questionUserAnswers = userAnswers[questionIndex] ?? [];
                        const questionIsCorrect = areAnswersExactMatch(
                            questionUserAnswers,
                            question.correctIndices,
                        );

                        const questionClassNames = ["quiz-review-question"];
                        if (!questionIsCorrect) {
                            questionClassNames.push("quiz-review-question-error");
                        }

                        return (
                            <article
                                key={`${question.question}-${questionIndex}`}
                                className={questionClassNames.join(" ")}
                            >
                                <div className="quiz-review-header">
                                    <h4>
                                        {t("results.reviewQuestion", {
                                            number: questionIndex + 1,
                                        })}
                                    </h4>

                                    <span
                                        className={[
                                            "quiz-review-status",
                                            questionIsCorrect
                                                ? "quiz-review-status-correct"
                                                : "quiz-review-status-incorrect",
                                        ].join(" ")}
                                    >
                                        {questionIsCorrect
                                            ? t("results.correct")
                                            : t("results.incorrect")}
                                    </span>
                                </div>

                                <p className="quiz-review-question-text">{question.question}</p>

                                <div className="quiz-review-answers">
                                    {question.answers.map((answer, answerIndex) => {
                                        const isUserAnswer = questionUserAnswers.includes(answerIndex);
                                        const isCorrectAnswer = question.correctIndices.includes(answerIndex);

                                        const answerClassNames = ["quiz-review-answer"];
                                        let answerLabel = "";

                                        if (isCorrectAnswer) {
                                            answerClassNames.push("quiz-review-correct");
                                            answerLabel = t("results.correctLabel");
                                        }

                                        if (isUserAnswer && !isCorrectAnswer) {
                                            answerClassNames.push("quiz-review-user-wrong");
                                            answerLabel = t("results.yourAnswer");
                                        }

                                        if (isUserAnswer && isCorrectAnswer) {
                                            answerLabel = t("results.yourAnswer");
                                        }

                                        return (
                                            <div
                                                key={`${question.question}-${answerIndex}-${answer}`}
                                                className={answerClassNames.join(" ")}
                                            >
                                                <span>{answer}</span>
                                                {answerLabel.length > 0 && (
                                                    <span className="quiz-answer-label">{answerLabel}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </article>
                        );
                    })}

                    <div className="quiz-result-buttons">
                        <button
                            type="button"
                            className="quiz-primary-button"
                            onClick={handleTryAgain}
                        >
                            {t("results.tryAgain")}
                        </button>
                        <button
                            type="button"
                            className="quiz-secondary-button"
                            onClick={handleNewQuiz}
                        >
                            {t("results.newQuiz")}
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
