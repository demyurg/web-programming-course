import { makeAutoObservable } from 'mobx';
import { Question, Answer } from '../types5/quiz';
import { mockQuestions } from '../data5/questions';

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
    this.questions = [...mockQuestions];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    // Проверяем, что ответ еще не был выбран и игра идет
    if (this.selectedAnswer !== null || this.gameStatus !== 'playing') {
      return;
    }

    this.selectedAnswer = answerIndex;
    
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    // Проверяем правильность ответа
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      this.score += this.getPointsForDifficulty(currentQuestion.difficulty);
    }

    // Сохраняем в историю ответов
    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect: isCorrect
    });
  }

  nextQuestion() {
    if (this.isLastQuestion) {
      this.finishGame();
      return;
    }

    this.currentQuestionIndex++;
    this.selectedAnswer = null;
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

  // Вспомогательный метод для получения очков за сложность
  private getPointsForDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
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
    return this.answeredQuestions.filter(answer => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();