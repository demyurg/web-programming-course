export interface Question {
  id: string | number;
  question: string;
 options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: string | number;
  selectedAnswer: number | number[]; // изменено для поддержки множественного выбора
 isCorrect: boolean;
}