export interface QuizQuestion {
    question: string;
    answers: string[];
    correctIndices: number[];
}

export type QuizValidationErrorCode =
    | "empty-input"
    | "no-valid-questions"
    | "incomplete-question"
    | "invalid-question-count"
    | "question-count-exceeds-available";

export interface QuizValidationError {
    code: QuizValidationErrorCode;
    questionNumber?: number;
    availableQuestions?: number;
}

export type ScoreMessageTier = "excellent" | "great" | "notBad" | "keepStudying";