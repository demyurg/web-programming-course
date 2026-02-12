import { makeAutoObservable } from 'mobx';
import type { Question, Answer } from '../types/quiz';
import type { QuestionPreview } from "../../generated/api/quizBattleAPI.schemas";

export class GameStore {
  isPlaying: boolean = false;

  questions: QuestionPreview[] = [];
  currentQuestionIndex = 0;
  score = 0;

  selectedAnswers: number[] = [];
  textAnswer: string = '';
  answers: Answer[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  toggleAnswer(index: number) {
    this.selectedAnswers = this.selectedAnswers.includes(index)
      ? this.selectedAnswers.filter((i) => i !== index)
      : [...this.selectedAnswers, index];
  }

  saveCurrentAnswer() {
    const q = this.currentQuestion;
    if (!q) return;

    this.answers.push({
      questionId: q.id,
      selectedAnswers: [...this.selectedAnswers],
      isCorrect: false,
      points: 0
    });
  }

  resetSelectedAnswers() {
    this.selectedAnswers = [];
  }

  setTextAnswer(text: string) {
    this.textAnswer = text;
  }

  setQuestionsFromAPI(questions: QuestionPreview[]) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.textAnswer = '';
    this.answers = [];
    this.score = 0;
  }

  updateAnswerResult(isCorrect: boolean, points: number = 0) {
    const last = this.answers[this.answers.length - 1];
    if (!last) return;

    last.isCorrect = isCorrect;
    last.points = points;

    this.score += points;
  }

  startGame() {
    this.isPlaying = true;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.selectedAnswers = [];
    this.textAnswer = '';

    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishGame();
    }
  }

  finishGame() {
    this.isPlaying = false;
  }

  resetGame() {
    this.isPlaying = false;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.textAnswer = '';
    this.answers = [];
    this.questions = [];
  }

  get currentQuestion(): Question | undefined {
    const q = this.questions[this.currentQuestionIndex];
    if (!q) return undefined;

    return {
      id: q.id,
      type: (q as any).type ?? "choice",
      question: (q as any).question ?? (q as any).text ?? "",
      options: q.options ?? [],
      correctAnswer: -1,
      difficulty: (q as any).difficulty ?? "easy",
      maxPoints: q.maxPoints ?? 0,
      minLength: q.minLength ?? 0
    };
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return Math.round(
      ((this.currentQuestionIndex + 1) / this.questions.length) * 100
    );
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answers.filter(a => a.isCorrect).length;
  }
}

export const gameStore = new GameStore();
export default gameStore;
