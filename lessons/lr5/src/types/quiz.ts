// types/quiz.ts

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';
export type Theme = 'light' | 'dark';

// ===== Базовый вопрос =====
interface BaseQuestion {
  id: string | number;
  question: string;
  maxPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ===== Multiple-select =====
export interface MultipleSelectQuestion extends BaseQuestion {
  type: 'multiple-select';
  options: string[];
}

// ===== Essay =====
export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  minLength: number;
  maxLength: number;
}

// ===== Универсальный =====
export type Question = MultipleSelectQuestion | EssayQuestion;

// ===== Ответ от сервера =====
export interface ServerAnswerResult {
  questionId: string | number;
  pointsEarned: number;
  isCorrect: boolean;
}

// ===== Ответ пользователя (локальный лог) =====
export interface Answer {
  questionId: string | number;
  selectedAnswer?: number[];
  essayAnswer?: string;
  isCorrect: boolean;
}
