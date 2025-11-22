import { makeAutoObservable } from "mobx";
import { QuestionFromAPI } from "../types/quiz";

interface AnswerHistory {
  questionId: string | number;
  selectedAnswers: number[];
  correctAnswers: number[];
  isCorrect: boolean;
  pointsEarned?: number;
}

class GameStore {
  public gameStatus: "idle" | "playing" | "finished" = "idle";
  public questions: QuestionFromAPI[] = [];
  public currentQuestionIndex = 0;
  public score = 0;
  public selectedAnswers: number[] = [];
  public answeredQuestions: AnswerHistory[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  toggleAnswer(answerIndex: number) {
    if (this.selectedAnswers.includes(answerIndex)) {
      this.selectedAnswers = this.selectedAnswers.filter(
        (i) => i !== answerIndex
      );
    } else {
      this.selectedAnswers = [...this.selectedAnswers, answerIndex].sort(
        (a, b) => a - b
      );
    }
  }

  saveCurrentAnswer() {
    const q = this.currentQuestion!;
    this.answeredQuestions.push({
      questionId: q.id,
      selectedAnswers: [...this.selectedAnswers],
      correctAnswers: [],
      isCorrect: false,
    });
  }

  updateAnswerResult(
    questionId: string | number,
    isCorrect: boolean,
    pointsEarned: number
  ) {
    const answer = this.answeredQuestions.find(
      (a) => a.questionId === questionId
    );
    if (answer) {
      answer.isCorrect = isCorrect;
      answer.pointsEarned = pointsEarned;
    }
    if (isCorrect) {
      this.score += pointsEarned;
    }
  }
  setQuestionsFromAPI(questions: QuestionFromAPI[]) {
    this.questions = questions;
  }

  startGame = () => {
    this.gameStatus = "playing";
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswers = [];
    this.answeredQuestions = [];
  };

  nextQuestion = () => {
    if (this.isLastQuestion) {
      this.gameStatus = "finished";
    } else {
      this.currentQuestionIndex += 1;
      this.selectedAnswers = [];
    }
  };

  finishGame = () => {
    this.gameStatus = "finished";
  };

  resetGame = () => {
    this.gameStatus = "idle";
    this.questions = [];
  };

  get currentQuestion(): QuestionFromAPI | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    const answered = this.selectedAnswers.length > 0 ? 1 : 0;
    return (
      ((this.currentQuestionIndex + answered) / this.questions.length) * 100
    );
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter((a) => a.isCorrect).length;
  }
}

export const gameStore = new GameStore();
