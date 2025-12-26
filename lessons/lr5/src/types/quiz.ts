export interface Question {
 id: string | number;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // изменено для поддержки множественного выбора
  difficulty: 'easy' | 'medium' | 'hard';
  maxPoints?: number; // максимальное количество баллов за вопрос
  type?: 'multiple-choice' | 'multiple-select' | 'essay'; // тип вопроса
  minLength?: number; // минимальная длина для essay вопросов
  maxLength?: number; // максимальная длина для essay вопросов
}

export interface Answer {
  questionId: string | number;
  selectedAnswer: number | number[] | string; // изменено для поддержки множественного выбора и essay
  isCorrect: boolean;
  pointsAwarded: number; // количество начисленных баллов за ответ
}