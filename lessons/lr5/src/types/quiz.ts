export interface QuestionFromAPI {
  id: string | number;
  question: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
}

export interface Question extends QuestionFromAPI {
  correctAnswer?: number;
}

export interface Answer {
  questionId: string | number;
  selectedAnswer: number[];
  isCorrect: boolean;
  pointsEarned?: number;
}

export type GameStatus = "idle" | "playing" | "finished";
export type Theme = "light" | "dark";
