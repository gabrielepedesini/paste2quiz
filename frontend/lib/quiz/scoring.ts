import { QuizQuestion, ScoreMessageTier } from "./types";

export function areAnswersExactMatch(userAnswerIndices: number[], correctIndices: number[]): boolean {
    if (userAnswerIndices.length !== correctIndices.length) {
        return false;
    }

    const userSorted = [...userAnswerIndices].sort((a, b) => a - b);
    const correctSorted = [...correctIndices].sort((a, b) => a - b);

    return userSorted.every((value, index) => value === correctSorted[index]);
}

export function calculateScore(questions: QuizQuestion[], userAnswers: number[][]): number {
    let score = 0;

    for (let i = 0; i < questions.length; i += 1) {
        const question = questions[i];
        const userAnswerIndices = userAnswers[i] ?? [];

        if (areAnswersExactMatch(userAnswerIndices, question.correctIndices)) {
            score += 1;
        }
    }

    return score;
}

export function calculatePercentage(score: number, totalQuestions: number): number {
    if (totalQuestions === 0) {
        return 0;
    }

    return Math.round((score / totalQuestions) * 100);
}

export function getScoreMessageTier(percentage: number): ScoreMessageTier {
    if (percentage >= 90) {
        return "excellent";
    }

    if (percentage >= 70) {
        return "great";
    }

    if (percentage >= 50) {
        return "notBad";
    }

    return "keepStudying";
}