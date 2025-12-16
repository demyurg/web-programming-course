import { makeAutoObservable } from 'mobx';
import { mockQuestions } from '../data/questions';
import { Question } from '../types/quiz';

type GameStatus = 'idle' | 'playing' | 'finished';

interface GameStatistics {
  totalGames: number;
  bestScore: number;
  averageScore: number;
  totalCorrectAnswers: number;
}

export class GameStore {
  gameStatus: GameStatus = 'idle';
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  score = 0;
  questions: Question[] = mockQuestions;
  timer = 0;
  timerInterval: number | null = null;
  statistics: GameStatistics = {
    totalGames: 0,
    bestScore: 0,
    averageScore: 0,
    totalCorrectAnswers: 0
  };

  constructor() {
    makeAutoObservable(this);
    this.loadStatistics();
  }

  // Computed values
  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.score;
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Actions
  startGame = () => {
    this.gameStatus = 'playing';
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.score = 0;
    this.timer = 0;
    this.startTimer();
  };

  // Переключает выбор варианта (для множественного выбора)
  toggleAnswer = (answerIndex: number) => {
    if (this.gameStatus !== 'playing') return;

    const idx = this.selectedAnswers.indexOf(answerIndex);
    if (idx === -1) {
      this.selectedAnswers = [...this.selectedAnswers, answerIndex];
    } else {
      const copy = [...this.selectedAnswers];
      copy.splice(idx, 1);
      this.selectedAnswers = copy;
    }
  };

  nextQuestion = () => {
    // Оцениваем текущий ответ перед переходом
    if (this.currentQuestion && this.selectedAnswers.length > 0) {
      const correct = this.currentQuestion.correctAnswer;
      if (this.selectedAnswers.includes(correct)) {
        this.score += 1;
      }
    }

    if (this.isLastQuestion) {
      this.finishGame();
    } else {
      this.currentQuestionIndex += 1;
      this.selectedAnswers = [];
    }
  };

  finishGame = () => {
    this.gameStatus = 'finished';
    this.stopTimer();
    this.updateStatistics();
  };

  resetGame = () => {
    this.gameStatus = 'idle';
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.score = 0;
    this.timer = 0;
    this.stopTimer();
  };

  // Timer methods
  startTimer = () => {
    this.timerInterval = window.setInterval(() => {
      this.timer += 1;
    }, 1000);
  };

  stopTimer = () => {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  };

  // Statistics methods
  updateStatistics = () => {
    const oldTotalGames = this.statistics.totalGames;
    const newTotalGames = oldTotalGames + 1;
    const newTotalCorrectAnswers = this.statistics.totalCorrectAnswers + this.score;
    
    this.statistics = {
      totalGames: newTotalGames,
      bestScore: Math.max(this.statistics.bestScore, this.score),
      averageScore: newTotalCorrectAnswers / newTotalGames,
      totalCorrectAnswers: newTotalCorrectAnswers
    };
    
    this.saveStatistics();
  };

  loadStatistics = () => {
    try {
      const saved = localStorage.getItem('quiz-statistics');
      if (saved) {
        this.statistics = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  saveStatistics = () => {
    try {
      localStorage.setItem('quiz-statistics', JSON.stringify(this.statistics));
    } catch (error) {
      console.error('Failed to save statistics:', error);
    }
  };
}

export const gameStore = new GameStore();
