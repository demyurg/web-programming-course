import type { TrainingSet, Answer } from "../domain";

const API_URL = "http://localhost:3001";

export async function fetchTrainingSet(id: string): Promise<TrainingSet> {
  const response = await fetch(`${API_URL}/api/sets/${id}`);
  if (!response.ok) throw new Error("Ошибка загрузки модуля");
  return response.json();
}

export async function createAttempt(setId: string) {
  const response = await fetch(`${API_URL}/api/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ setId }),
  });
  if (!response.ok) throw new Error("Ошибка создания попытки");
  return response.json();
}

export async function saveAnswer(attemptId: string, answer: Answer) {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/answers/${answer.taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answer),
  });
  if (!response.ok) throw new Error("Ошибка сохранения ответа");
  return response.json();
}

export async function deleteAnswer(attemptId: string, taskId: string) {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/answers/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Ошибка удаления ответа");
  return response.json();
}

export async function submitAttempt(attemptId: string) {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error("Ошибка завершения попытки");
  return response.json();
}

export async function fetchResult(attemptId: string) {
  const response = await fetch(`${API_URL}/api/attempts/${attemptId}/result`);
  if (!response.ok) throw new Error("Ошибка загрузки результата");
  return response.json();
}