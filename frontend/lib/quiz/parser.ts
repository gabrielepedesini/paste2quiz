import { QuizQuestion } from "./types";

export function parseQuizText(text: string): QuizQuestion[] {
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const parsedQuestions: QuizQuestion[] = [];
    let currentQuestion: QuizQuestion | null = null;
    let currentField: "question" | "answer" | null = null;

    for (const line of lines) {
        if (line.startsWith("@Q:")) {
            if (currentQuestion) {
                parsedQuestions.push(currentQuestion);
            }
            currentQuestion = {
                question: line.substring(3).trim(),
                answers: [],
                correctIndices: [],
            };
            currentField = "question";
            continue;
        }

        if (line.startsWith("@A*:")) {
            if (currentQuestion) {
                currentQuestion.correctIndices.push(currentQuestion.answers.length);
                currentQuestion.answers.push(line.substring(4).trim());
                currentField = "answer";
            }
            continue;
        }

        if (line.startsWith("@A:")) {
            if (currentQuestion) {
                currentQuestion.answers.push(line.substring(3).trim());
                currentField = "answer";
            }
            continue;
        }

        // Continuation line, so append to whichever field was last being built
        if (currentQuestion && currentField === "question") {
            currentQuestion.question += " " + line;
        } else if (currentQuestion && currentField === "answer" && currentQuestion.answers.length > 0) {
            currentQuestion.answers[currentQuestion.answers.length - 1] += " " + line;
        }
    }

    if (currentQuestion) {
        parsedQuestions.push(currentQuestion);
    }

    return parsedQuestions;
}

function shuffleArray<T>(array: T[], random: () => number): T[] {
    const next = [...array];

    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }

    return next;
}

export function randomizeQuestions(
    questions: QuizQuestion[],
    random: () => number = Math.random,
): QuizQuestion[] {
    const randomizedQuestions = questions.map((question) => {
        const correctAnswers = question.correctIndices.map((index) => question.answers[index]);
        const shuffledAnswers = shuffleArray(question.answers, random);
        const remappedCorrectIndices: number[] = [];

        for (let i = 0; i < shuffledAnswers.length; i += 1) {
            if (correctAnswers.includes(shuffledAnswers[i])) {
                remappedCorrectIndices.push(i);
            }
        }

        return {
            question: question.question,
            answers: shuffledAnswers,
            correctIndices: remappedCorrectIndices,
        };
    });

    return shuffleArray(randomizedQuestions, random);
}