import { makeAutoObservable } from 'mobx';
import { Question, Answer } from '../types/quiz';
import { mockQuestions } from '../data/questions';

/**
 * GameStore - MobX Store для управления игровой логикой
 *
 * Используется в Task2 и Task4
 */
class GameStore {
  // Observable состояние
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';

  // TODO: Добавьте другие поля состояния:
   questions: Question[] = [];
   currentQuestionIndex = 0;
   score = 0;
   selectedAnswer: number | null = null;
   answeredQuestions: Answer[] = [];

  constructor() {
     this.questions = mockQuestions;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    makeAutoObservable(this);
  }

  // Actions - методы для изменения состояния

  startGame() {
    this.gameStatus = 'playing';
  this.gameStatus = 'playing';
    this.questions = mockQuestions; 
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];

  }

  selectAnswer(answerIndex: number) {
    if (this.selectedAnswer !== null) return;
    this.selectedAnswer = answerIndex;

    const current = this.currentQuestion;
    if (!current) return;

    const isCorrect = answerIndex === current.correctAnswer;
    if (isCorrect) this.score++;

    this.answeredQuestions.push({
      questionId: current.id,
      selectedAnswer: answerIndex,
      isCorrect,
    });
  }

  

  // TODO: Добавьте другие методы:
  // nextQuestion() - переход к следующему вопросу
  // finishGame() - завершение игры
  // resetGame() - сброс к начальным значениям
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

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // TODO: Верните текущий вопрос из массива questions
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    // TODO: Вычислите прогресс в процентах (0-100)
     if (this.questions.length === 0) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100);
  }

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  // get correctAnswersCount(): number
  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(a => a.isCorrect).length;
  }
}

export const gameStore = new GameStore();
