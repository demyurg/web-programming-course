import type { TrainingSet, Answer } from "../domain/domain.js";
import type { SetSummary, Attempt, Result, ApiErrorBody } from "./types.js";


const API_BASE = "http://localhost:3001";

//Общая обёртка над fetch для всех запросов к учебному API. T — тип успешного JSON-ответа.
async function request<T>(
  path: string,
  init?: { method?: "POST" | "PUT" | "DELETE"; body?: unknown }
): Promise<T> {
  // 1. Собираем options: метод по умолчанию GET
  const options: RequestInit = { method: init?.method ?? "GET" };

  // 2. Заголовок Content-Type и сериализация нужны ТОЛЬКО когда есть тело
  if (init?.body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(init.body);
  }

  // 3. Сам запрос; ошибка сети отклонит Promise здесь — поймает вызывающий код
  const response = await fetch(`${API_BASE}${path}`, options);

  // 4. HTTP 400/404/409/500 НЕ отклоняют fetch, поэтому проверяем ok ДО чтения JSON
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      message = errorBody.error.message;
    } catch {
      // тело ошибки не читается — оставляем сообщение с кодом статуса
    }
    throw new Error(message);
  }

  // 5. Успешные ответы сервера (200/201) всегда содержат JSON
  return (await response.json()) as T;
}

// GET /api/sets — список наборов 
export function getSets(): Promise<SetSummary[]> {
  return request<SetSummary[]>("/api/sets");
}

// GET /api/sets/:id — задания набора 
export function getSet(setId: string): Promise<TrainingSet> {
  return request<TrainingSet>(`/api/sets/${setId}`);
}

// POST /api/attempts — создать попытку; тело ровно { setId } 
export function createAttempt(setId: string): Promise<Attempt> {
  return request<Attempt>("/api/attempts", { method: "POST", body: { setId } });
}

// GET /api/attempts/:id — прочитать подтверждённую попытку 
export function getAttempt(attemptId: string): Promise<Attempt> {
  return request<Attempt>(`/api/attempts/${attemptId}`);
}

// PUT /api/attempts/:id/answers/:taskId — сохранить/заменить ответ 
export function saveAnswer(attemptId: string, answer: Answer): Promise<Attempt> {
  return request<Attempt>(
    `/api/attempts/${attemptId}/answers/${answer.taskId}`,
    { method: "PUT", body: answer }
  );
}

// DELETE /api/attempts/:id/answers/:taskId — очистить ответ 
export function deleteAnswer(attemptId: string, taskId: string): Promise<Attempt> {
  return request<Attempt>(
    `/api/attempts/${attemptId}/answers/${taskId}`,
    { method: "DELETE" }
  );
}

// POST /api/attempts/:id/submit — завершить; тело ровно {} 
export function submitAttempt(attemptId: string): Promise<Result> {
  return request<Result>(`/api/attempts/${attemptId}/submit`, {
    method: "POST",
    body: {},
  });
}

// GET /api/attempts/:id/result — результат (409 до завершения) 
export function getResult(attemptId: string): Promise<Result> {
  return request<Result>(`/api/attempts/${attemptId}/result`);
}