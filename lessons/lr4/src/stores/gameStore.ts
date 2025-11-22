/**
 * src/stores/gameStore.ts
 * Полностью реализованный MobX Store для Задания 2
 */

import { makeAutoObservable } from "mobx";
import { mockQuestions } from "../data/questions";
import { Question } from "../types/quiz";

interface Answer {
  questionId: number;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
}

class GameStore {
  // Observable состояние — все public, чтобы Task2 видел
  public gameStatus: "idle" | "playing" | "finished" = "idle";
  public questions: Question[] = [];
  public currentQuestionIndex = 0;
  public score = 0;
  public selectedAnswer: number | null = null;
  public answeredQuestions: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // === Actions ===

  startGame = () => {
    this.gameStatus = "playing";
    this.questions = mockQuestions;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  };

  selectAnswer = (answerIndex: number) => {
    if (this.selectedAnswer !== null) return; // нельзя менять ответ

    this.selectedAnswer = answerIndex;

    const currentQ = this.questions[this.currentQuestionIndex];
    const isCorrect = answerIndex === currentQ.correctAnswer;

    if (isCorrect) {
      this.score += 1;
    }

    // Сохраняем ответ в историю
    this.answeredQuestions.push({
      questionId: currentQ.id,
      selectedIndex: answerIndex,
      correctIndex: currentQ.correctAnswer,
      isCorrect,
    });
  };

  nextQuestion = () => {
    if (this.isLastQuestion) {
      this.gameStatus = "finished";
    } else {
      this.currentQuestionIndex += 1;
      this.selectedAnswer = null;
    }
  };

  finishGame = () => {
    this.gameStatus = "finished";
  };

  resetGame = () => {
    this.gameStatus = "idle";
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  };

  // === Computed значения ===

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    const answered = this.selectedAnswer !== null ? 1 : 0;
    return (
      ((this.currentQuestionIndex + answered) / this.questions.length) * 100
    );
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.score;
  }
}

// Экспорт единственного экземпляра
export const gameStore = new GameStore();
