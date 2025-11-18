import { makeAutoObservable } from 'mobx';
import { Question, Answer } from '../types/quiz';
import { mockQuestions } from '../data/questions.ts';

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
  selectedAnswers: number[] = []; // Изменено на массив
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
    this.selectedAnswers = []; // Изменено на массив
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    console.log('Selected answer:', answerIndex);

    if (this.currentQuestion) {
      // Для одиночного выбора - заменяем массив
      this.selectedAnswers = [answerIndex];

      const isCorrect = answerIndex === this.currentQuestion.correctAnswer;
      if (isCorrect) {
        this.score += 1;
      }

      this.answeredQuestions.push({
        questionId: this.currentQuestion.id,
        selectedAnswer: answerIndex,
        isCorrect
      });
    }
  }

  // Новый метод для переключения выбора ответа
  toggleAnswer(answerIndex: number) {
    if (!this.currentQuestion) return;

    const currentIndex = this.selectedAnswers.indexOf(answerIndex);

    if (currentIndex === -1) {
      // Добавляем ответ
      this.selectedAnswers.push(answerIndex);
    } else {
      // Удаляем ответ
      this.selectedAnswers.splice(currentIndex, 1);
    }
  }

  // TODO: Добавьте другие методы:
  // nextQuestion() - переход к следующему вопросу
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex += 1;
      this.selectedAnswers = []; // Изменено на массив
    } else {
      this.finishGame();
    }
  }

  // finishGame() - завершение игры
  finishGame() {
    this.gameStatus = 'finished';
  }

  // resetGame() - сброс к начальным значениям
  resetGame() {
    this.gameStatus = 'idle';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = []; // Изменено на массив
    this.answeredQuestions = [];
  }

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // TODO: Верните текущий вопрос из массива questions
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    // TODO: Вычислите прогресс в процентах (0-100)
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  // get correctAnswersCount(): number
  get correctAnswersCount(): number {
    return this.score;
  }

  // Новое computed value для проверки выбран ли ответ
  get isAnswerSelected(): boolean {
    return this.selectedAnswers.length > 0;
  }
}

export const gameStore = new GameStore();