export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: number;
  question: string;  // Добавим для удобства
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timestamp: Date;
  timeSpent: number;  // Время, потраченное на ответ в секундах
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';

// Интерфейс для статистики игры
export interface GameStats {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
}
