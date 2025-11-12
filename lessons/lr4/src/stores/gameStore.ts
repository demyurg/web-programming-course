import { makeAutoObservable } from 'mobx';
import { Question, Answer } from '../types/quiz';
import { mockQuestions } from '../data/questions';

/**
 * GameStore - MobX Store для управления игровой логикой
 * Используется в Task2 и Task4
 */
class GameStore {
  // Observable состояние
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer: number | null = null;
  answeredQuestions: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // === Actions ===

  startGame() {
    this.questions = mockQuestions;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.gameStatus = 'playing';
  }

  selectAnswer(answerIndex: number) {
    // Не даём выбрать второй раз
    if (this.selectedAnswer !== null) return;

    this.selectedAnswer = answerIndex;

    const current = this.currentQuestion;
    if (!current) return;

    const isCorrect = answerIndex === current.correctAnswer;
    if (isCorrect) {
      this.score += 1;
    }

    // Добавляем в историю
    this.answeredQuestions.push({
      questionId: current.id,
      selectedAnswer: answerIndex,
      isCorrect,
    });
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
    } else {
      this.finishGame();
    }
  }

  finishGame() {
    this.gameStatus = 'finished';
  }

  resetGame() {
    this.gameStatus = 'idle';
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  // === Computed values ===

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex) / this.questions.length) * 100;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter((a) => a.isCorrect).length;
  }
}

export const gameStore = new GameStore();
