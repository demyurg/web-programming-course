export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Answer {
  questionId: number
  selectedAnswer: number
  isCorrect: boolean
}

export interface AnswerWithTime extends Answer {
  timeSpent: number
}

export interface GameStats {
  totalGamesPlayed: number
  bestScore: number
  averageScore: number
  totalCorrectAnswers: number
  totalQuestions: number
  averageTimePerQuestion: number
  lastPlayedDate: string
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished'

export type Theme = 'light' | 'dark'

export type ModalType = 'settings' | 'statistics' | 'help' | null
