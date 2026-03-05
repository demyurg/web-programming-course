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
  question: Question[] = mockQuestions;
  currentQuestionIndex: number = 0;
  score: number = 0;
  selectedAnswer: number | null = null;
  answeredQuestions: Answer[] = [];

  timeRemaining = 0;
  totalTimeSpent = 0;
  gameStartTime = 0;
  timerInterval: number | null = null;

  // TODO: Добавьте другие поля состояния:
  // questions: Question[] = [];
  // currentQuestionIndex = 0;
  // score = 0;
  // selectedAnswer: number | null = null;
  // answeredQuestions: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Actions - методы для изменения состояния

  startGame() {
    this.gameStatus = 'playing';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.question = mockQuestions;
    this.totalTimeSpent = 0;
    this.timeRemaining = 30;
    this.gameStartTime = Date.now();
    this.startTimer();
    // TODO: Добавьте остальную логику:
    // - Загрузите вопросы из mockQuestions
    // - Сбросьте счётчики и индексы
  }

  selectAnswer(answerIndex: number) {
    console.log('Selected answer:', answerIndex);
    if (this.selectedAnswer === null) {
      this.selectedAnswer = answerIndex;

      if (answerIndex === this.question[this.currentQuestionIndex].correctAnswer) {
        this.score = this.score + 1;
      }
      let newAnswer: Answer = {
          questionId: this.currentQuestionIndex,
          selectedAnswer: answerIndex,
          isCorrect: answerIndex === this.question[this.currentQuestionIndex].correctAnswer

        }
      this.answeredQuestions.push(newAnswer);
    }
    // TODO: Реализуйте логику выбора ответа:
    // 1. Проверьте, что ответ еще не был выбран
    // 2. Сохраните выбранный ответ
    // 3. Проверьте правильность (сравните с correctAnswer)
    // 4. Увеличьте счёт если правильно
    // 5. Сохраните в историю ответов
  }

  nextQuestion(){
    if (this.isLastQuestion){
      this.finishGame();
      return;
    }

    this.currentQuestionIndex++;
    this.selectedAnswer = null;

  }

  finishGame(){
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
    this.question = [];
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

  // TODO: Добавьте другие методы:
  // nextQuestion() - переход к следующему вопросу
  // finishGame() - завершение игры
  // resetGame() - сброс к начальным значениям

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // TODO: Верните текущий вопрос из массива questions
    return this.question[this.currentQuestionIndex];
  }

  get progress(): number {
    // TODO: Вычислите прогресс в процентах (0-100)
    return (this.currentQuestionIndex / this.question.length) * 100;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.question.length-1
  }

  get correctAnswersCount(): number {
    return this.score;
  }

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  // get correctAnswersCount(): number
}

export const gameStore = new GameStore();
