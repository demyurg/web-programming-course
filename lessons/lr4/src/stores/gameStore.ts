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
    makeAutoObservable(this);
  }

  // Actions - методы для изменения состояния

  startGame() {
    this.gameStatus = 'playing';
    // TODO: Добавьте остальную логику:
    // - Загрузите вопросы из mockQuestions
    // - Сбросьте счётчики и индексы

    this.questions = mockQuestions;

    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    console.log('Selected answer:', answerIndex);
    if (this.selectedAnswer !== null) return;

    this.selectedAnswer = answerIndex;

    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = answerIndex === question.correctAnswer;

    if (isCorrect) {
      this.score += 1;
    }

    this.answeredQuestions.push({
      questionId: question.id,
      selectedAnswer: answerIndex,
      isCorrect
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
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.questions = [];
  }

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return Math.round(
      ((this.currentQuestionIndex + 1) / this.questions.length) * 100
    );
    return 0;
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
