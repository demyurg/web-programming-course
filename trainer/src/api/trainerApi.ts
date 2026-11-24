import type { Answer, Task, TrainingSet } from "../domain";
import type { Attempt, Result, ResultItem } from "../attempt";

const baseUrl = "http://localhost:3001/api";
const requestTimeoutMs = 10_000;

type ModuleSummary = { id: string; title: string; taskCount: number };

export class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(`HTTP ${status}. ${message}`);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isModuleSummary(value: unknown): value is ModuleSummary {
  return isObject(value) && isId(value.id) && typeof value.title === "string" && isCount(value.taskCount);
}

function isTask(value: unknown): value is Task {
  if (!isObject(value) || !isId(value.id) || typeof value.topic !== "string" ||
      typeof value.prompt !== "string" || (value.code !== undefined && typeof value.code !== "string")) return false;
  if (value.kind === "short-text") return value.options === undefined;
  return value.kind === "single-choice" && Array.isArray(value.options) &&
    value.options.every((option) => isObject(option) && isId(option.id) && typeof option.label === "string") &&
    new Set(value.options.map((option) => option.id)).size === value.options.length;
}

function isTrainingSet(value: unknown): value is TrainingSet {
  return isObject(value) && isId(value.id) && typeof value.title === "string" &&
    Array.isArray(value.tasks) && value.tasks.every(isTask) &&
    new Set(value.tasks.map(({ id }) => id)).size === value.tasks.length;
}

function isAnswer(value: unknown, tasks: Task[]): value is Answer {
  if (!isObject(value) || !isId(value.taskId)) return false;
  const task = tasks.find(({ id }) => id === value.taskId);
  if (task?.kind === "short-text") return value.kind === task.kind && typeof value.text === "string";
  return task?.kind === "single-choice" && value.kind === task.kind &&
    task.options.some(({ id }) => id === value.optionId);
}

function isAttempt(value: unknown, set: TrainingSet, expectedId?: string): value is Attempt {
  return isObject(value) && isId(value.id) && (expectedId === undefined || value.id === expectedId) &&
    value.setId === set.id && (value.status === "in-progress" || value.status === "submitted") &&
    Array.isArray(value.answers) && value.answers.every((answer) => isAnswer(answer, set.tasks)) &&
    new Set(value.answers.map(({ taskId }) => taskId)).size === value.answers.length;
}

function isResultItem(value: unknown): value is ResultItem {
  if (!isObject(value) || !isId(value.taskId) || !isCount(value.maxScore) ||
      typeof value.feedback !== "string") return false;
  if (value.status === "pending-review") return value.score === null;
  return (value.status === "correct" || value.status === "incorrect" || value.status === "unanswered") &&
    isCount(value.score) && value.score <= value.maxScore;
}

function isResult(value: unknown, attemptId: string, tasks: Task[]): value is Result {
  return isObject(value) && value.attemptId === attemptId && isCount(value.maxScore) &&
    (value.status === "pending-review" ? value.score === null :
      value.status === "graded" && isCount(value.score) && value.score <= value.maxScore) &&
    Array.isArray(value.items) && value.items.every(isResultItem) &&
    value.items.length === tasks.length && new Set(value.items.map(({ taskId }) => taskId)).size === tasks.length &&
    value.items.every(({ taskId }) => tasks.some(({ id }) => id === taskId));
}

async function request<T>(path: string, decode: (value: unknown) => value is T, method = "GET", body?: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(baseUrl + path, {
      method,
      signal: AbortSignal.timeout(requestTimeoutMs),
      ...(body === undefined ? {} : {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Сервер не ответил вовремя.");
    }
    throw new Error("Не удалось связаться с учебным сервером.");
  }

  const value: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message = isObject(value) && isObject(value.error) && typeof value.error.message === "string"
      ? value.error.message : "Учебный сервер отклонил запрос.";
    throw new HttpError(response.status, message);
  }
  if (!decode(value)) throw new Error("Учебный сервер вернул данные в неожиданном формате.");
  return value;
}

function attemptPath(attemptId: string) {
  return `/attempts/${encodeURIComponent(attemptId)}`;
}

export async function loadModule(): Promise<TrainingSet | undefined> {
  const modules = await request("/sets", (value): value is ModuleSummary[] =>
    Array.isArray(value) && value.every(isModuleSummary));
  const moduleId = modules[0]?.id;
  if (moduleId === undefined) return;
  return request(`/sets/${encodeURIComponent(moduleId)}`, (value): value is TrainingSet =>
    isTrainingSet(value) && value.id === moduleId);
}

export function createAttempt(set: TrainingSet) {
  return request("/attempts", (value): value is Attempt =>
    isAttempt(value, set) && value.status === "in-progress" && value.answers.length === 0, "POST", { setId: set.id });
}

export function fetchAttempt(set: TrainingSet, attemptId: string) {
  return request(attemptPath(attemptId), (value): value is Attempt => isAttempt(value, set, attemptId));
}

export function saveAnswer(set: TrainingSet, attemptId: string, answer: Answer) {
  return request(`${attemptPath(attemptId)}/answers/${encodeURIComponent(answer.taskId)}`,
    (value): value is Attempt => isAttempt(value, set, attemptId) && value.status === "in-progress" &&
      value.answers.some((saved) => saved.taskId === answer.taskId && (saved.kind === "short-text"
        ? answer.kind === "short-text" && saved.text === answer.text
        : answer.kind === "single-choice" && saved.optionId === answer.optionId)), "PUT", answer);
}

export function clearAnswer(set: TrainingSet, attemptId: string, taskId: string) {
  return request(`${attemptPath(attemptId)}/answers/${encodeURIComponent(taskId)}`,
    (value): value is Attempt => isAttempt(value, set, attemptId) && value.status === "in-progress" &&
      !value.answers.some((answer) => answer.taskId === taskId), "DELETE");
}

export function submitAttempt(set: TrainingSet, attemptId: string) {
  return request(`${attemptPath(attemptId)}/submit`, (value): value is Result =>
    isResult(value, attemptId, set.tasks), "POST", {});
}

export function fetchResult(set: TrainingSet, attemptId: string) {
  return request(`${attemptPath(attemptId)}/result`, (value): value is Result => isResult(value, attemptId, set.tasks));
}
