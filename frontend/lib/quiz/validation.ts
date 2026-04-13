import { QuizQuestion, QuizValidationError } from "./types";

export function validateQuizInput(input: string): QuizValidationError | null {
    if (input.trim().length === 0) {
        return { code: "empty-input" };
    }

    return null;
}

export function validateParsedQuestions(questions: QuizQuestion[]): QuizValidationError | null {
    if (questions.length === 0) {
        return { code: "no-valid-questions" };
    }

    for (let i = 0; i < questions.length; i += 1) {
        const question = questions[i];
        if (
            question.question.trim().length === 0 ||
            question.answers.length === 0 ||
            question.correctIndices.length === 0
        ) {
            return {
                code: "incomplete-question",
                questionNumber: i + 1,
            };
        }
    }

    return null;
}

export function validateQuestionCount(
    input: string,
    availableQuestions: number,
): QuizValidationError | null {
    const normalizedInput = input.trim();

    if (normalizedInput.length === 0) {
        return null;
    }

    if (!/^\d+$/.test(normalizedInput)) {
        return { code: "invalid-question-count" };
    }

    const questionCount = Number(normalizedInput);

    if (!Number.isInteger(questionCount) || questionCount < 1) {
        return { code: "invalid-question-count" };
    }

    if (questionCount > availableQuestions) {
        return {
            code: "question-count-exceeds-available",
            availableQuestions,
        };
    }

    return null;
}