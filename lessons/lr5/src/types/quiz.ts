export type QuestionType = 'multiple-select' | 'essay';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string | number;
  type: QuestionType;
  question: string;
  options?: string[];
  difficulty: Difficulty;
  maxPoints: number;
  minLength?: number;
  maxLength?: number;
}

export interface Answer {
  questionId: string | number;
  selectedAnswers?: number[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned?: number;
}

