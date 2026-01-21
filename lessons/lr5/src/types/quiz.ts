export interface Question {
  id: string | number; // Было: id: number
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: string | number; // Было: questionId: number
  selectedAnswer: number;
  isCorrect: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';
