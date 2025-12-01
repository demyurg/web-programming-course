import { makeAutoObservable } from 'mobx';
import { Question, Answer, GameStats } from '../types/quiz';
import { mockQuestions } from '../data/questions';

class GameStore {
  gameStatus: 'idle' | 'playing' | 'paused' | 'finished' = 'idle';
  questions: Question[] = mockQuestions;
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer: number | null = null;
  answeredQuestions: Answer[] = [];
  timer = 0;
  timerInterval: NodeJS.Timeout | null = null;
  startTime: Date | null = null;
  endTime: Date | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  startGame() {
    this.gameStatus = 'playing';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.timer = 0;
    this.startTime = new Date();
    this.endTime = null;
    this.startTimer();
  }

  selectAnswer(answerIndex: number) {
    if (this.selectedAnswer !== null || this.gameStatus !== 'playing') return;

    this.selectedAnswer = answerIndex;
    const isCorrect = answerIndex === this.currentQuestion?.correctAnswer;
    
    const answer: Answer = {
      questionId: this.currentQuestion?.id || 0,
      question: this.currentQuestion?.question || '',
      selectedAnswer: answerIndex,
      correctAnswer: this.currentQuestion?.correctAnswer || 0,
      isCorrect,
      timestamp: new Date(),
      timeSpent: this.timer
    };
    
    this.answeredQuestions.push(answer);
    
    if (isCorrect) {
      this.score += 10;
    }
  }

  nextQuestion() {
    if (this.selectedAnswer === null || this.gameStatus !== 'playing') return;

    if (this.currentQuestionIndex >= this.questions.length - 1) {
      this.finishGame();
    } else {
      this.currentQuestionIndex += 1;
      this.selectedAnswer = null;
      this.timer = 0;
    }
  }

  pauseGame() {
    this.gameStatus = 'paused';
    this.stopTimer();
  }

  resumeGame() {
    this.gameStatus = 'playing';
    this.startTimer();
  }

  finishGame() {
    this.gameStatus = 'finished';
    this.endTime = new Date();
    this.stopTimer();
  }

  resetGame() {
    this.gameStatus = 'idle';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.timer = 0;
    this.startTime = null;
    this.endTime = null;
    this.stopTimer();
  }

  // Таймер
  startTimer() {
    if (this.timerInterval) return;
    
    this.timerInterval = setInterval(() => {
      this.timer += 1;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
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
    return this.answeredQuestions.filter(answer => answer.isCorrect).length;
  }

  get totalTimeSpent(): number {
    if (!this.startTime || !this.endTime) return this.timer;
    return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }

  get averageTimePerQuestion(): number {
    if (this.answeredQuestions.length === 0) return 0;
    const totalTime = this.answeredQuestions.reduce((sum, answer) => sum + answer.timeSpent, 0);
    return Math.floor(totalTime / this.answeredQuestions.length);
  }

  get accuracy(): number {
    if (this.answeredQuestions.length === 0) return 0;
    return Math.round((this.correctAnswersCount / this.answeredQuestions.length) * 100);
  }

  get gameStats(): GameStats {
    return {
      score: this.score,
      totalQuestions: this.questions.length,
      correctAnswers: this.correctAnswersCount,
      accuracy: this.accuracy,
      totalTimeSpent: this.totalTimeSpent,
      averageTimePerQuestion: this.averageTimePerQuestion
    };
  }
}

export const gameStore = new GameStore();