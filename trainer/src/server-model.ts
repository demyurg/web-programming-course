import type { Answer } from "./domain";
import type { AttemptStatus } from "./attempt";

// Данные, которые приходят от сервера (контракт курса).

export type SetSummary = { id: string; title: string; taskCount: number };

export type ServerAttempt = {
  id: string;
  setId: string;
  status: AttemptStatus;
  answers: Answer[];
};

export type ResultStatus = "graded" | "pending-review";
export type ItemStatus = "correct" | "incorrect" | "unanswered" | "pending-review";

export type ResultItem = {
  taskId: string;
  status: ItemStatus;
  score: number | null;
  maxScore: number;
  feedback: string;
};

export type Result = {
  attemptId: string;
  status: ResultStatus;
  score: number | null;
  maxScore: number;
  items: ResultItem[];
};
