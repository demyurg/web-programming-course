import type { Answer } from "../domain";

// Статус попытки на сервере
export type AttemptStatus = "in-progress" | "submitted";

// Объект попытки, который возвращает сервер
export type Attempt = {
  id: string;
  setId: string;
  status: AttemptStatus;
  answers: Answer[];
};

// Статус проверки конкретного задания в результате
export type ItemStatus = "correct" | "incorrect" | "unanswered" | "pending-review";

// Один элемент результата
export type ResultItem = {
  taskId: string;
  status: ItemStatus;
  score: number | null; // null, если ожидает проверки
  maxScore: number;
  feedback: string;
};

// Общий результат попытки
export type Result = {
  attemptId: string;
  status: "graded" | "pending-review";
  score: number | null; // null, если есть вопросы, ожидающие проверки
  maxScore: number;
  items: ResultItem[];
};

// Формат ошибки от сервера
export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};