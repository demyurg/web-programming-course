// Нам не нужны, противоречат с сгенерированными
// export interface QuestionPreview {
//   id: string | number;
//   question: string;
//   options: string[];
//   difficulty: "easy" | "medium" | "hard";
// }

// export interface Question extends QuestionPreview {
//   correctAnswer: number[]; // массив индексов правильных ответов
// }

// export interface Answer {
//   questionId: string | number;
//   selectedAnswers: number[];
//   isCorrect: boolean;
// }

export type GameStatus = "idle" | "playing" | "finished";
export type Theme = "light" | "dark";
