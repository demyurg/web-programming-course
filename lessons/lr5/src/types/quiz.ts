export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number[]; 
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: string;  
  selectedAnswer: number[];
  isCorrect: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';
