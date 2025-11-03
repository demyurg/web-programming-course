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

  timeRemaining = 0;
  totalTimeSpent = 0;
  gameStartTime = 0;
  timerInterval: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Actions - методы для изменения состояния

  startGame() {
    this.gameStatus = 'playing';
    // TODO: Добавьте остальную логику:
    // - Загрузите вопросы из mockQuestions
    // - Сбросьте счётчики и индексы
    this.questions = [...mockQuestions];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.totalTimeSpent = 0;

    this.timeRemaining = 30;
    this.gameStartTime = Date.now();
    this.startTimer();
  }

  selectAnswer(answerIndex: number) {
    console.log('Selected answer:', answerIndex);
    // TODO: Реализуйте логику выбора ответа:
    // 1. Проверьте, что ответ еще не был выбран
    // 2. Сохраните выбранный ответ
    // 3. Проверьте правильность (сравните с correctAnswer)
    // 4. Увеличьте счёт если правильно
    // 5. Сохраните в историю ответов
    if (this.selectedAnswer !== null || this.gameStatus !== 'playing') {
      return;
    }

    this.selectedAnswer = answerIndex;

    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
        
    // Сохраняем ответ в историю
    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect: isCorrect,
    });

    // Начисляем очки за правильный ответ
    if (isCorrect) {
        this.score += 1;
      }
      this.stopTimer();
  }

  // TODO: Добавьте другие методы:
  // nextQuestion() - переход к следующему вопросу
  // finishGame() - завершение игры
  // resetGame() - сброс к начальным значениям

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
    this.totalTimeSpent = Date.now() - this.gameStartTime;
    this.stopTimer();
  }

  resetGame() {
    this.gameStatus = 'idle';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.questions = [];
    this.timeRemaining = 0;
    this.totalTimeSpent = 0;
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer(); // Останавливаем предыдущий таймер
    
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        // Время вышло - автоматически переходим к следующему вопросу
        this.stopTimer();
        if (this.selectedAnswer === null) {
          // Если ответ не выбран, считаем неправильным
          this.selectAnswer(-1); // -1 означает, что ответ не выбран
        }
        
        // Автопереход через 2 секунды после истечения времени
        setTimeout(() => {
          if (this.gameStatus === 'playing' && this.selectedAnswer !== null) {
            this.nextQuestion();
          }
        }, 2000);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
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

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }
  // get correctAnswersCount(): number
  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(answer => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();
