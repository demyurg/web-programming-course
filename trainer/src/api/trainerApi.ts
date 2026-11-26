import type { Answer, TrainingSet } from "../domain";

const API = "http://localhost:3001";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type SetSummary = {
  id: string;
  title: string;
  taskCount: number;
};

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
  feedback: string;
};

export type AttemptResult = {
  attemptId: string;
  status: "graded" | "pending-review";
  score: number | null;
  maxScore: number;
  items: ResultItem[];
};

async function request<T>(
  path: string,
  method: string,
  body: unknown,
  demoFail: boolean,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (demoFail) headers["X-Demo-Fail"] = "1";

  let response: Response;
  try {
    response = await fetch(API + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Нет соединения с сервером");
  }

  if (!response.ok) {
    let message = `Ошибка сервера (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error?.message) message = data.error.message;
    } catch {}
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export function getSets(demoFail: boolean) {
  return request<SetSummary[]>("/api/sets", "GET", undefined, demoFail);
}

export function getSet(id: string, demoFail: boolean) {
  return request<TrainingSet>(`/api/sets/${id}`, "GET", undefined, demoFail);
}

export function createAttempt(setId: string, demoFail: boolean) {
  return request<ServerAttempt>(
    "/api/attempts",
    "POST",
    { setId },
    demoFail,
  );
}

export function getAttempt(id: string, demoFail: boolean) {
  return request<ServerAttempt>(
    `/api/attempts/${id}`,
    "GET",
    undefined,
    demoFail,
  );
}

export function putAnswer(attemptId: string, answer: Answer, demoFail: boolean) {
  return request<ServerAttempt>(
    `/api/attempts/${attemptId}/answers/${answer.taskId}`,
    "PUT",
    answer,
    demoFail,
  );
}

export function deleteAnswer(
  attemptId: string,
  taskId: string,
  demoFail: boolean,
) {
  return request<ServerAttempt>(
    `/api/attempts/${attemptId}/answers/${taskId}`,
    "DELETE",
    undefined,
    demoFail,
  );
}

export function submitAttempt(attemptId: string, demoFail: boolean) {
  return request<AttemptResult>(
    `/api/attempts/${attemptId}/submit`,
    "POST",
    {},
    demoFail,
  );
}

export function getResult(attemptId: string, demoFail: boolean) {
  return request<AttemptResult>(
    `/api/attempts/${attemptId}/result`,
    "GET",
    undefined,
    demoFail,
  );
}
