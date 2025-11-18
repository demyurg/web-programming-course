import { makeAutoObservable } from "mobx";
import { Question, Answer } from "../types/quiz";
import { mockQuestions } from "../data/questions";


class GameStore {
  gameStatus: "idle" | "playing" | "finished" = "idle";

  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer: number | null = null;
  answeredQuestions: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }


  startGame() {
    this.gameStatus = "playing";
    this.questions = mockQuestions;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    console.log("Selected answer:", answerIndex);
    if (this.selectedAnswer !== null) return;

    this.selectedAnswer = answerIndex;

    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      this.score += 1;
    }

    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
    });
  }

  nextQuestion() {
    if (this.isLastQuestion) {
      this.finishGame();
    } else {
      this.currentQuestionIndex += 1;
      this.selectedAnswer = null;
    }
  }

  finishGame() {
    this.gameStatus = "finished";
  }

  resetGame() {
    this.gameStatus = "idle";
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }


  get currentQuestion(): Question | null {
    if (this.questions.length === 0) return null;
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
    return this.answeredQuestions.filter((answer) => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();
