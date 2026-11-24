import type { TrainingSet, Answer, Attempt, Result } from "../model/domain";

const BASE_URL = "http://localhost:3001/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    // Пытаемся прочитать сообщение об ошибке от сервера
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Ошибка сервера: ${res.status}`);
  }

  return res.json();
}

export const trainerApi = {
  // 1. Загрузить модуль
  getSet: (setId: string) => request<TrainingSet>(`/sets/${setId}`),

  // 2. Создать попытку
  createAttempt: (setId: string) => 
    request<Attempt>("/attempts", {
      method: "POST",
      body: JSON.stringify({ setId }),
    }),

  // 3. Восстановить попытку
  getAttempt: (attemptId: string) => request<Attempt>(`/attempts/${attemptId}`),

  // 4. Сохранить ответ
  saveAnswer: (attemptId: string, answer: Answer) => 
    request<Attempt>(`/attempts/${attemptId}/answers/${answer.taskId}`, {
      method: "PUT",
      body: JSON.stringify(answer),
    }),

  // 5. Удалить ответ
  deleteAnswer: (attemptId: string, taskId: string) => 
    request<Attempt>(`/attempts/${attemptId}/answers/${taskId}`, {
      method: "DELETE",
    }),

  // 6. Завершить попытку
  submitAttempt: (attemptId: string) => 
    request<Result>(`/attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};