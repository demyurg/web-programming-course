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
  // questions: Question[] = [];
  // currentQuestionIndex = 0;
  // score = 0;
  // selectedAnswer: number | null = null;
  // answeredQuestions: Answer[] = [];

  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer: number | null = null;
  answeredQuestions: Answer[] = [];

  // task4
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
    this.questions = mockQuestions;
    // - Сбросьте счётчики и индексы
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
    if (this.selectedAnswer !== null || this.gameStatus !== 'playing') {return;}

    // 2. Сохраните выбранный ответ
    this.selectedAnswer = answerIndex;

    // 3. Проверьте правильность (сравните с correctAnswer)
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    // 4. Увеличьте счёт если правильно
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // 5. Сохраните в историю ответов
    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect: isCorrect,
    });

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
    // if (this.currentQuestionIndex < this.questions.length - 1) {
    //   this.currentQuestionIndex++;
    //   this.selectedAnswer = null;
    // } else {
    //   this.finishGame();
    // }
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
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.timeRemaining = 0;
    this.totalTimeSpent = 0;
    this.stopTimer();
  }

  // task4
  // Таймер
  startTimer() {
    this.stopTimer();

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.stopTimer();
        if (this.selectedAnswer === null) {
          this.selectAnswer(5);
        }

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
      clearInterval(this.timerInterval)
      this.timerInterval = null;
    }
  }

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // TODO: Верните текущий вопрос из массива questions
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    // TODO: Вычислите прогресс в процентах (0-100)
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100
  }

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  // get correctAnswersCount(): number

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === (this.questions.length - 1)
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter((a) => a.isCorrect).length
  }
}
export const gameStore = new GameStore();
