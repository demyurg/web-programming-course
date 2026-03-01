import { makeAutoObservable } from "mobx";
import { Question, Answer } from "../types/quiz";
import { mockQuestions } from "../data/questions";

/**
 * GameStore - MobX Store для управления игровой логикой
 *
 * Используется в Task2 и Task4
 */
class GameStore {
  // Observable состояние
  gameStatus: "idle" | "playing" | "finished" = "idle";
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
    this.gameStatus = "playing";
    this.questions = [...mockQuestions];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    // Проверяем, что ответ еще не был выбран и игра идет
    if (this.selectedAnswer !== null || this.gameStatus !== "playing") {
      return;
    }

    this.selectedAnswer = answerIndex;

    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Увеличиваем счет если правильно
    if (isCorrect) {
      this.score += 1;
    }

    // Сохраняем в историю ответов
    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
    });
  }

  nextQuestion() {
    // Проверяем, что есть следующий вопрос
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex += 1;
      this.selectedAnswer = null;
    } else {
      // Если это последний вопрос - завершаем игру
      this.finishGame();
    }
  }

  finishGame() {
    this.gameStatus = "finished";
  }

  resetGame() {
    this.gameStatus = "idle";
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter((answer) => answer.isCorrect).length;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get currentQuestionNumber(): number {
    return this.currentQuestionIndex + 1;
  }
}

export const gameStore = new GameStore();
