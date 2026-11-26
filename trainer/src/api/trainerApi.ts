import type {
  Answer,
  AttemptResult,
  ServerAttempt,
  TrainingSet,
  TrainingSetSummary,
} from "../domain";

const API_BASE_URL = "http://localhost:3001";

export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.status = status;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function request(
  path: string,
  init: RequestInit = {},
  demoFail = false,
): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (demoFail) headers["X-Demo-Fail"] = "1";

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Нет соединения с сервером http://localhost:3001.");
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) throw new ApiError(`Ошибка сервера (HTTP ${response.status}).`, response.status);
    throw new ApiError("Сервер вернул некорректный JSON.", response.status);
  }

  if (!response.ok) {
    const serverMessage =
      isObject(data) && isObject(data.error) && typeof data.error.message === "string"
        ? `HTTP ${response.status}: ${data.error.message}`
        : `Ошибка сервера (HTTP ${response.status}).`;
    throw new ApiError(serverMessage, response.status);
  }

  return data;
}

function assertAttempt(data: unknown): ServerAttempt {
  if (
    !isObject(data) ||
    typeof data.id !== "string" ||
    typeof data.setId !== "string" ||
    (data.status !== "in-progress" && data.status !== "submitted") ||
    !Array.isArray(data.answers)
  ) {
    throw new ApiError("Сервер вернул некорректные данные попытки.");
  }
  return data as ServerAttempt;
}

function assertResult(data: unknown): AttemptResult {
  if (
    !isObject(data) ||
    typeof data.attemptId !== "string" ||
    (data.status !== "graded" && data.status !== "pending-review") ||
    (data.score !== null && typeof data.score !== "number") ||
    typeof data.maxScore !== "number" ||
    !Array.isArray(data.items)
  ) {
    throw new ApiError("Сервер вернул некорректные данные результата.");
  }
  return data as AttemptResult;
}

export async function getSets(): Promise<TrainingSetSummary[]> {
  const data = await request("/api/sets");
  if (!Array.isArray(data)) throw new ApiError("Некорректный список модулей.");
  return data as TrainingSetSummary[];
}

export async function getSetById(setId: string): Promise<TrainingSet> {
  const data = await request(`/api/sets/${encodeURIComponent(setId)}`);
  if (!isObject(data) || typeof data.id !== "string" || typeof data.title !== "string" || !Array.isArray(data.tasks)) {
    throw new ApiError("Некорректные данные модуля.");
  }
  return data as TrainingSet;
}

export async function createAttempt(setId: string, demoFail = false): Promise<ServerAttempt> {
  const data = await request(
    "/api/attempts",
    { method: "POST", body: JSON.stringify({ setId }) },
    demoFail,
  );
  return assertAttempt(data);
}

export async function getAttempt(attemptId: string): Promise<ServerAttempt> {
  const data = await request(`/api/attempts/${encodeURIComponent(attemptId)}`);
  return assertAttempt(data);
}

export async function saveAnswer(
  attemptId: string,
  answer: Answer,
  demoFail = false,
): Promise<ServerAttempt> {
  const data = await request(
    `/api/attempts/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(answer.taskId)}`,
    { method: "PUT", body: JSON.stringify(answer) },
    demoFail,
  );
  return assertAttempt(data);
}

export async function deleteAnswer(
  attemptId: string,
  taskId: string,
  demoFail = false,
): Promise<ServerAttempt> {
  const data = await request(
    `/api/attempts/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(taskId)}`,
    { method: "DELETE" },
    demoFail,
  );
  return assertAttempt(data);
}

export async function submitAttempt(attemptId: string, demoFail = false): Promise<AttemptResult> {
  const data = await request(
    `/api/attempts/${encodeURIComponent(attemptId)}/submit`,
    { method: "POST", body: JSON.stringify({}) },
    demoFail,
  );
  return assertResult(data);
}

export async function getAttemptResult(attemptId: string): Promise<AttemptResult> {
  const data = await request(`/api/attempts/${encodeURIComponent(attemptId)}/result`);
  return assertResult(data);
}