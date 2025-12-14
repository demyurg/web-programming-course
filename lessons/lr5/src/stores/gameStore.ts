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
    // Загрузите вопросы из mockQuestions
    this.questions = mockQuestions.map((q: any) => ({
      ...q,
      id: q.id.toString() // преобразуем id в строку для совместимости с API
    }));
    // Сбросьте счётчики и индексы
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    // Проверьте, что ответ еще не был выбран
    if (this.selectedAnswer !== null) return;
    
    // Сохраните выбранный ответ
    this.selectedAnswer = answerIndex;
    
    // Проверьте правильность (сравните с correctAnswer)
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Увеличьте счёт если правильно
    if (isCorrect) {
      this.score += 1;
    }
    
    // Сохраните в историю ответов
    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect
    });
  }

  // Другие методы:
  nextQuestion() {
    if (this.isLastQuestion) {
      this.finishGame();
    } else {
      this.currentQuestionIndex += 1;
      this.selectedAnswer = null;
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
    // Верните текущий вопрос из массива questions
    if (this.questions.length === 0) return null;
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    // Вычислите прогресс в процентах (0-100)
    if (this.questions.length === 0) return 0;
    return (this.currentQuestionIndex / this.questions.length) * 100;
  }

  // Другие computed values:
 get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(answer => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();