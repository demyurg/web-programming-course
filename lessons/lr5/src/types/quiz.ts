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

// ===== Multiple-select вопрос =====
export interface MultipleSelectQuestion extends BaseQuestion {
  type: 'multiple-select';
  options: string[];
}

// ===== Essay вопрос =====
export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  minLength: number;
  maxLength: number;
}

// ===== Универсальный тип вопроса =====
export type Question = MultipleSelectQuestion | EssayQuestion;

// ===== Ответ пользователя =====
export interface Answer {
  questionId: string | number;
  selectedAnswer?: number[];    // для multiple-select
  essayAnswer?: string;         // для essay
  isCorrect?: boolean;
}
