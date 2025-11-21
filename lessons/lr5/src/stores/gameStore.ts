import { makeAutoObservable,action } from 'mobx';
import { Question, Answer } from '../types/quiz';
import { mockQuestions } from '../data/questions';

class GameStore {
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers: number[] = [];
  answeredQuestions: Answer[] = [];
  timeLeft = 300;
  timerInterval: any = null;
  correctAnswersCount = 0;
  pastScores: number[] = [];

  constructor() {
    makeAutoObservable(this);

  }

  // ===== Инициализация игры =====
  startGame(questions: Question[] = mockQuestions) {
    this.gameStatus = 'playing';
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.correctAnswersCount = 0;
    this.timeLeft = 300;
    this.startTimer();
  }

 startTimer = () => {
    this.stopTimer();
    if (this.gameStatus !== 'playing') return;

    this.timerInterval = setInterval(
      action(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.stopTimer();
          this.submitCurrentAnswerAndNext();
        }
      }),
      1000
    );
  };

  stopTimer = () => {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  };

  // ===== Выбор ответа =====
  toggleAnswer(index: number) {
    const isSelected = this.selectedAnswers.includes(index);
    if (isSelected) {
      this.selectedAnswers = this.selectedAnswers.filter((i) => i !== index);
    } else {
      this.selectedAnswers = [...this.selectedAnswers, index];
    }
  }

  // ===== Сохранение ответа =====
  saveCurrentAnswer() {
    const current = this.currentQuestion;
    if (!current) return;

    // Проверка правильности
    const correctIndexes = current.correctAnswer !== undefined ? [current.correctAnswer] : [];
    const isCorrect =
      correctIndexes.length === this.selectedAnswers.length &&
      correctIndexes.every((v) => this.selectedAnswers.includes(v));

    const pointsEarned = isCorrect ? current.points ?? 1 : 0;
    this.updateAnswerResult(pointsEarned, isCorrect);

    const answerRecord: Answer = {
      questionId: current.id,
      selectedAnswer: [...this.selectedAnswers],
      isCorrect,
    };

    this.answeredQuestions.push(answerRecord);
    this.selectedAnswers = [];
  }

  // ===== Обновление счета =====
  updateAnswerResult(pointsEarned: number, isCorrect: boolean) {
    this.score += pointsEarned;
    if (isCorrect) this.correctAnswersCount += 1;
  }

  // ===== Переход к следующему вопросу =====
  nextQuestion() {
    this.saveCurrentAnswer();

    if (this.isLastQuestion) {
      this.finishGame();
      return;
    }

    this.currentQuestionIndex++;
    this.selectedAnswers = [];
    this.timeLeft = 300;
    this.startTimer();
  }

  submitCurrentAnswerAndNext() {
    this.saveCurrentAnswer();
    this.nextQuestion();
  }

  finishGame() {
    this.gameStatus = 'finished';
    this.pastScores.push(this.score);
    localStorage.setItem('quizPastScores', JSON.stringify(this.pastScores));
    this.stopTimer();
  }

  resetGame() {
    this.gameStatus = 'idle';
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.correctAnswersCount = 0;
    this.timeLeft = 300;
    this.stopTimer();
  }

  setQuestionsFromAPI(questions: Question[]) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
    this.correctAnswersCount = 0;
  }

  // ===== Геттеры =====
  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    return this.questions.length
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }
}

export const gameStore = new GameStore();
