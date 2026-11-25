import type { Answer, Task, TrainingSet } from "./domain.js";

export const API_BASE = "http://localhost:3001";

export type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export class ApiError extends Error {
  readonly status: number | undefined;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type SetSummary = { id: string; title: string };

export type ServerAttempt = {
  id: string;
  setId: string;
  status: "in-progress" | "submitted";
  answers: Answer[];
};

export type ResultItem = {
  taskId: string;
  status: "correct" | "incorrect" | "unanswered" | "pending-review";
  score: number | null;
  maxScore: number;
  feedback?: string;
};

export type AttemptResult = {
  status: "submitted" | "pending-review" | "graded";
  score: number | null;
  maxScore: number;
  items: ResultItem[];
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  failHeader?: boolean;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.failHeader) headers["X-Demo-Fail"] = "1";

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Нет соединения: сервер недоступен");
  }
  if (!response.ok) {
    throw new ApiError(
      `Ошибка сервера: HTTP ${response.status}`,
      response.status,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// --- Валидация JSON ---
function parseTask(raw: unknown): Task {
  if (typeof raw !== "object" || raw === null) {
    throw new ApiError("Неверный формат задания: не объект");
  }
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string") {
    throw new ApiError("Неверный формат задания: нет id");
  }
  const question =
    typeof t.question === "string"
      ? t.question
      : typeof t.prompt === "string"
        ? t.prompt
        : null;
  if (question === null) {
    throw new ApiError(`Задание ${t.id}: нет поля question/prompt`);
  }
  const topic = typeof t.topic === "string" ? t.topic : "";
  const code = typeof t.code === "string" ? t.code : undefined;

  if (t.kind === "single-choice") {
    if (!Array.isArray(t.options)) {
      throw new ApiError(`Задание ${t.id}: нет массива options`);
    }
    const options = (t.options as unknown[]).map((o, index) => {
      if (typeof o === "string") return { id: `${t.id}-opt-${index}`, text: o };
      if (typeof o !== "object" || o === null) {
        throw new ApiError(`Задание ${t.id}: вариант не объект`);
      }
      const opt = o as Record<string, unknown>;
      const text =
        typeof opt.text === "string"
          ? opt.text
          : typeof opt.label === "string"
            ? opt.label
            : null;
      if (typeof opt.id !== "string" || text === null) {
        throw new ApiError(`Задание ${t.id}: у варианта нет id/text`);
      }
      return { id: opt.id, text };
    });
    return { id: t.id, kind: "single-choice", topic, question, code, options };
  }
  if (t.kind === "short-text") {
    return { id: t.id, kind: "short-text", topic, question, code };
  }
  throw new ApiError(`Задание ${t.id}: неизвестный kind «${String(t.kind)}»`);
}

function parseSet(raw: unknown): TrainingSet {
  if (typeof raw !== "object" || raw === null)
    throw new ApiError("Неверный формат набора");
  const s = raw as Record<string, unknown>;
  if (
    typeof s.id !== "string" ||
    typeof s.title !== "string" ||
    !Array.isArray(s.tasks)
  ) {
    throw new ApiError("Неверный формат набора");
  }
  return {
    id: s.id,
    title: s.title,
    tasks: (s.tasks as unknown[]).map(parseTask),
  };
}

function parseSets(raw: unknown): SetSummary[] {
  if (!Array.isArray(raw)) throw new ApiError("Неверный формат списка наборов");
  return (raw as unknown[]).map((item) => {
    if (typeof item !== "object" || item === null)
      throw new ApiError("Неверный формат набора");
    const s = item as Record<string, unknown>;
    if (typeof s.id !== "string" || typeof s.title !== "string") {
      throw new ApiError("Неверный формат набора");
    }
    return { id: s.id, title: s.title };
  });
}

function parseAnswer(raw: unknown): Answer {
  if (typeof raw !== "object" || raw === null) {
    throw new ApiError("Неверный формат ответа");
  }
  const a = raw as Record<string, unknown>;
  if (typeof a.taskId !== "string") {
    throw new ApiError("У ответа отсутствует taskId");
  }
  if (a.kind === "single-choice" && typeof a.optionId === "string") {
    return { taskId: a.taskId, kind: "single-choice", optionId: a.optionId };
  }
  if (a.kind === "short-text" && typeof a.text === "string") {
    return { taskId: a.taskId, kind: "short-text", text: a.text };
  }
  throw new ApiError(`Неверный формат ответа для задания ${a.taskId}`);
}

function parseAttempt(raw: unknown): ServerAttempt {
  if (typeof raw !== "object" || raw === null)
    throw new ApiError("Неверный формат попытки");
  const a = raw as Record<string, unknown>;
  if (typeof a.id !== "string" || typeof a.setId !== "string") {
    throw new ApiError("Неверный формат попытки");
  }
  const status =
    a.status === "in-progress" || a.status === "submitted"
      ? a.status
      : "in-progress";
  const answers = Array.isArray(a.answers)
    ? (a.answers as unknown[]).map(parseAnswer)
    : [];
  return { id: a.id, setId: a.setId, status, answers };
}

function parseResultItem(raw: unknown): ResultItem {
  if (typeof raw !== "object" || raw === null) {
    throw new ApiError("Неверный формат элемента результата");
  }
  const item = raw as Record<string, unknown>;
  if (typeof item.taskId !== "string") {
    throw new ApiError("У элемента результата нет taskId");
  }
  const allowed = ["correct", "incorrect", "unanswered", "pending-review"];
  if (typeof item.status !== "string" || !allowed.includes(item.status)) {
    throw new ApiError(`Неверный статус элемента: «${String(item.status)}»`);
  }
  if (item.score !== null && typeof item.score !== "number") {
    throw new ApiError("Неверный формат score элемента");
  }
  return {
    taskId: item.taskId,
    status: item.status as ResultItem["status"],
    score: item.score,
    maxScore: typeof item.maxScore === "number" ? item.maxScore : 1,
    feedback: typeof item.feedback === "string" ? item.feedback : undefined,
  };
}

function parseResult(raw: unknown): AttemptResult {
  if (typeof raw !== "object" || raw === null) {
    throw new ApiError("Неверный формат результата");
  }
  const root = raw as Record<string, unknown>;
  const r =
    typeof root.result === "object" && root.result !== null
      ? (root.result as Record<string, unknown>)
      : root;

  if (
    r.status !== "submitted" &&
    r.status !== "pending-review" &&
    r.status !== "graded"
  ) {
    throw new ApiError(`Неверный статус результата: «${String(r.status)}»`);
  }
  if (r.score !== null && typeof r.score !== "number") {
    throw new ApiError("Неверный формат score");
  }
  const items = Array.isArray(r.items)
    ? (r.items as unknown[]).map(parseResultItem)
    : [];
  return {
    status: r.status,
    score: r.score,
    maxScore: typeof r.maxScore === "number" ? r.maxScore : items.length,
    items,
  };
}

export const api = {
  loadSets: () => request<unknown>("/api/sets").then(parseSets),
  loadSet: (id: string) =>
    request<unknown>(`/api/sets/${encodeURIComponent(id)}`).then(parseSet),
  createAttempt: (setId: string) =>
    request<unknown>("/api/attempts", { method: "POST", body: { setId } }).then(
      parseAttempt,
    ),
  loadAttempt: (attemptId: string) =>
    request<unknown>(`/api/attempts/${encodeURIComponent(attemptId)}`).then(
      parseAttempt,
    ),
  saveAnswer: (attemptId: string, answer: Answer, failHeader?: boolean) =>
    request<unknown>(
      `/api/attempts/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(answer.taskId)}`,
      { method: "PUT", body: answer, failHeader },
    ).then(parseAttempt),
  clearAnswer: (attemptId: string, taskId: string, failHeader?: boolean) =>
    request<unknown>(
      `/api/attempts/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(taskId)}`,
      { method: "DELETE", failHeader },
    ).then(parseAttempt),
  submit: (attemptId: string, failHeader?: boolean) =>
    request<unknown>(`/api/attempts/${encodeURIComponent(attemptId)}/submit`, {
      method: "POST",
      body: {},
      failHeader,
    }).then(parseResult),
  loadResult: (attemptId: string) =>
    request<unknown>(
      `/api/attempts/${encodeURIComponent(attemptId)}/result`,
    ).then(parseResult),
};
