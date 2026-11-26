import type { Answer, TrainingSet } from "../domain";

const API_BASE = "http://localhost:3001/api";

export type ServerAttempt = {
  id: string;
  setId: string;
  status: "in-progress" | "submitted";
  answers: Answer[];
};

export type ServerResultItem = {
  taskId: string;
  status: "correct" | "incorrect" | "unanswered" | "pending-review";
  score: number | null;
  maxScore: number;
  feedback: string;
};

export type ServerResult = {
  attemptId: string;
  status: "graded" | "pending-review";
  score: number | null;
  maxScore: number;
  items: ServerResultItem[];
};

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Проверка данных сервера
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isAnswer(v: unknown): v is Answer {
  return isObject(v) && typeof v.taskId === "string" &&
    ((v.kind === "single-choice" && typeof v.optionId === "string") ||
     (v.kind === "short-text" && typeof v.text === "string"));
}

function isTrainingSet(v: unknown): v is TrainingSet {
  return isObject(v) && typeof v.id === "string" &&
    typeof v.title === "string" && Array.isArray(v.tasks) &&
    v.tasks.every(t =>
      isObject(t) && typeof t.id === "string" &&
      typeof t.topic === "string" && typeof t.prompt === "string" &&
      (t.code === undefined || typeof t.code === "string") &&
      (t.kind === "short-text" ||
        (t.kind === "single-choice" && Array.isArray(t.options) &&
          t.options.every(o => isObject(o) &&
            typeof o.id === "string" && typeof o.label === "string")))
    );
}

function isAttempt(v: unknown): v is ServerAttempt {
  return isObject(v) && typeof v.id === "string" &&
    typeof v.setId === "string" &&
    (v.status === "in-progress" || v.status === "submitted") &&
    Array.isArray(v.answers) && v.answers.every(isAnswer);
}

function isResult(v: unknown): v is ServerResult {
  return isObject(v) && typeof v.attemptId === "string" &&
    (v.status === "graded" || v.status === "pending-review") &&
    (v.score === null || typeof v.score === "number") &&
    typeof v.maxScore === "number" && Array.isArray(v.items) &&
    v.items.every(i => isObject(i) && typeof i.taskId === "string" &&
      ["correct", "incorrect", "unanswered", "pending-review"].some(s => s === i.status) &&
      (i.score === null || typeof i.score === "number") &&
      typeof i.maxScore === "number" && typeof i.feedback === "string");
}

// Общая функция запроса
async function request<T>(
  path: string,
  validate: (v: unknown) => v is T,
  options: RequestInit = {},
  demoFail = false
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (demoFail) headers.set("X-Demo-Fail", "1");

  let response: Response;
  try {
    response = await fetch(API_BASE + path, { ...options, headers });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Нет соединения с сервером.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      data?.error?.code || "HTTP_ERROR",
      `HTTP ${response.status}: ${data?.error?.message || "Ошибка запроса"}`
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!validate(data)) {
    throw new ApiError(response.status, "INVALID_DATA", "Некорректные данные сервера.");
  }

  return data;
}

// Загрузка модуля
export function loadSet(setId: string) {
  return request(`/sets/${setId}`, isTrainingSet);
}

// Создание попытки
export function createAttempt(setId: string) {
  return request("/attempts", isAttempt, {
    method: "POST",
    body: JSON.stringify({ setId }),
  });
}

// Восстановление попытки
export function loadAttempt(attemptId: string) {
  return request(`/attempts/${attemptId}`, isAttempt);
}

// Сохранение ответа
export function saveAnswer(attemptId: string, answer: Answer, demoFail = false) {
  return request(`/attempts/${attemptId}/answers/${answer.taskId}`, isAttempt, {
    method: "PUT",
    body: JSON.stringify(answer),
  }, demoFail);
}

// Удаление ответа
export function deleteAnswer(attemptId: string, taskId: string) {
  return request(`/attempts/${attemptId}/answers/${taskId}`, isAttempt, {
    method: "DELETE",
  });
}

// Завершение попытки
export function submitAttempt(attemptId: string) {
  return request(`/attempts/${attemptId}/submit`, isResult, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Получение результата
export function loadResult(attemptId: string) {
  return request(`/attempts/${attemptId}/result`, isResult);
}