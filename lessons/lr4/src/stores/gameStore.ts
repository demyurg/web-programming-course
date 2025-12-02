import { makeAutoObservable } from 'mobx';
import { mockQuestions } from '../data/questions';
import { Question } from '../types/quiz';

class GameStore {
  // Состояние
  questions: Question[] = mockQuestions;
  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  score = 0;
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';

  constructor() {
    // makeAutoObservable автоматически делает свойства observable, 
    // а методы — actions, геттеры — computed values
    makeAutoObservable(this);
  }

  // Computed values (вычисляемые значения)
  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  get progress() {
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isLastQuestion() {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount() {
    return this.score;
  }

  // Actions (действия)
  startGame = () => {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.score = 0;
    this.gameStatus = 'playing';
  };

  selectAnswer = (index: number) => {
    // Запрещаем повторный выбор
    if (this.selectedAnswer !== null) return;

    this.selectedAnswer = index;

    if (index === this.currentQuestion.correctAnswer) {
      this.score++;
    }
  };

  nextQuestion = () => {
    if (this.isLastQuestion) {
      this.finishGame();
    } else {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
    }
  };

  finishGame = () => {
    this.gameStatus = 'finished';
  };

  resetGame = () => {
    // Сбрасываем в idle, чтобы показать стартовый экран, 
    // или можно сразу вызывать startGame() для перезапуска
    this.gameStatus = 'idle';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
  };
}

export const gameStore = new GameStore();