export interface Question {
  id: string | number;
  question: string;
  options?: string[];
  correctAnswer?: number; 
  points?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: string|number;
  selectedAnswer: number[];
  isCorrect: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';

