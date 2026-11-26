import type { Answer, TrainingSet } from "../domain";
import type { Result, ServerAttempt, SetSummary } from "../server-model";
import {
  parseAttempt,
  parseErrorMessage,
  parseResult,
  parseSetList,
  parseTrainingSet,
} from "./parse";

export const API_BASE = "http://localhost:3001";

export type ApiError = {
  kind: "network" | "http" | "invalid";
  status?: number;
  message: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

let demoFail = false;
export function setDemoFail(enabled: boolean): void {
  demoFail = enabled;
}

function fail(
  kind: ApiError["kind"],
  message: string,
  status?: number,
): { ok: false; error: ApiError } {
  return { ok: false, error: { kind, message, status } };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    const message = parseErrorMessage(body);
    if (message !== undefined) return `${message} (HTTP ${response.status})`;
  } catch {
    // тело ответа не JSON
  }
  return `Ошибка сервера (HTTP ${response.status})`;
}

async function request<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body: unknown,
  parse: (value: unknown) => T | undefined,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (demoFail) headers["X-Demo-Fail"] = "1";

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return fail(
      "network",
      "Нет соединения с сервером. Проверьте, что он запущен (node course/server/server.mjs).",
    );
  }

  if (!response.ok) {
    return fail("http", await readErrorMessage(response), response.status);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return fail("invalid", "Сервер вернул не JSON.", response.status);
  }

  const data = parse(json);
  if (data === undefined) {
    return fail("invalid", "Ответ сервера не соответствует контракту.", response.status);
  }
  return { ok: true, data };
}

function enc(part: string): string {
  return encodeURIComponent(part);
}

export function fetchSets(): Promise<ApiResult<SetSummary[]>> {
  return request("/api/sets", "GET", undefined, parseSetList);
}

export function fetchSet(setId: string): Promise<ApiResult<TrainingSet>> {
  return request(`/api/sets/${enc(setId)}`, "GET", undefined, parseTrainingSet);
}

export async function loadModule(): Promise<ApiResult<TrainingSet>> {
  const sets = await fetchSets();
  if (!sets.ok) return sets;
  const first = sets.data[0];
  if (first === undefined) return fail("invalid", "На сервере нет учебных модулей.");
  return fetchSet(first.id);
}


export function startAttempt(setId: string): Promise<ApiResult<ServerAttempt>> {
  return request("/api/attempts", "POST", { setId }, parseAttempt);
}

export function fetchAttempt(attemptId: string): Promise<ApiResult<ServerAttempt>> {
  return request(`/api/attempts/${enc(attemptId)}`, "GET", undefined, parseAttempt);
}

export function saveAnswer(
  attemptId: string,
  answer: Answer,
): Promise<ApiResult<ServerAttempt>> {
  return request(
    `/api/attempts/${enc(attemptId)}/answers/${enc(answer.taskId)}`,
    "PUT",
    answer,
    parseAttempt,
  );
}

export function deleteAnswer(
  attemptId: string,
  taskId: string,
): Promise<ApiResult<ServerAttempt>> {
  return request(
    `/api/attempts/${enc(attemptId)}/answers/${enc(taskId)}`,
    "DELETE",
    undefined,
    parseAttempt,
  );
}

export function submitServerAttempt(attemptId: string): Promise<ApiResult<Result>> {
  return request(`/api/attempts/${enc(attemptId)}/submit`, "POST", {}, parseResult);
}

export function fetchResult(attemptId: string): Promise<ApiResult<Result>> {
  return request(`/api/attempts/${enc(attemptId)}/result`, "GET", undefined, parseResult);
}
