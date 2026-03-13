import { makeAutoObservable } from 'mobx';
import type { Answer, Question } from '../types/quiz';

export class GameStore {
  isPlaying = false;
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  textAnswer = '';
  questions: Question[] = [];
  answers: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  startGame(questions: Question[]) {
    this.isPlaying = true;
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.textAnswer = '';
    this.answers = [];
  }

  finishGame() {
    this.isPlaying = false;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.textAnswer = '';
  }

  toggleAnswer(answerIndex: number) {
    if (this.selectedAnswers.includes(answerIndex)) {
      this.selectedAnswers = this.selectedAnswers.filter(
        (index) => index !== answerIndex,
      );
    } else {
      this.selectedAnswers = [...this.selectedAnswers, answerIndex];
    }
  }

  setTextAnswer(text: string) {
    this.textAnswer = text;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length) {
      this.currentQuestionIndex += 1;
    }
    this.selectedAnswers = [];
    this.textAnswer = '';
  }

  get currentQuestion(): Question | undefined {
    if (
      this.currentQuestionIndex < 0 ||
      this.currentQuestionIndex >= this.questions.length
    ) {
      return undefined;
    }
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return (
      this.questions.length > 0 &&
      this.currentQuestionIndex === this.questions.length - 1
    );
  }
}

export const gameStore = new GameStore();

export default gameStore;

