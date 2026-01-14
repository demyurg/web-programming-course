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
  timeLeft: number = 30;
  timerInterval: any = null;

  pastScores: number[] = [];

 
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
    this.questions = mockQuestions;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.timeLeft = 30;
    this.startTimer();
  
  }
startTimer() {
  this.stopTimer(); // не даём создать второй интервал поверх первого

  if (this.gameStatus !== 'playing') return;

  this.timerInterval = setInterval(() => {
    if (this.timeLeft > 0) {
      this.decreaseTimer();
    } else {
      this.stopTimer();
      this.nextQuestion();
    }
  }, 1000);
}


 stopTimer() {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
}
decreaseTimer() {
  this.timeLeft--;
}

  selectAnswer(answerIndex: number) {
    
    // TODO: Реализуйте логику выбора ответа:
    // 1. Проверьте, что ответ еще не был выбран
    // 2. Сохраните выбранный ответ
    // 3. Проверьте правильность (сравните с correctAnswer)
    // 4. Увеличьте счёт если правильно
    // 5. Сохраните в историю ответов
     if (this.selectedAnswer !== null) return; // уже ответил

    this.selectedAnswer = answerIndex;

    const current = this.currentQuestion;
    if (!current) return;

    const isCorrect = answerIndex === current.correctAnswer;
    if (isCorrect) {
      this.score++;
    }

    this.answeredQuestions.push({
      questionId: current.id,
      selectedAnswer: answerIndex,
      isCorrect
    });
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
   
    this.timeLeft = 30;
    this.startTimer();
  }

  finishGame() {
    this.gameStatus = 'finished';
    this.saveStatistics();
  }
  saveStatistics() {
    this.pastScores.push(this.score);
    localStorage.setItem('quizPastScores', JSON.stringify(this.pastScores));
  }

  resetGame() {
    this.gameStatus = 'idle';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
    this.stopTimer();
    this.timeLeft = 30;
  }

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // TODO: Верните текущий вопрос из массива questions
     return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    // TODO: Вычислите прогресс в процентах (0-100)
    if (!this.questions.length) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  // get correctAnswersCount(): number
   get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.score;
  }
  
}

export const gameStore = new GameStore();
