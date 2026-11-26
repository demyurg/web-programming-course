import type { Answer, TrainingSet } from "../domain";
import type { Attempt, Result } from "../model/apiTypes";
import { request } from "./http";

// Базовый URL нашего учебного сервера
const BASE_URL = "http://localhost:3001/api";

// Для демонстрации ошибки (500) на Этапе 5 мы передаем сюда заголовок
function getHeaders(extraHeaders?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
}

// 1. Получить список модулей (нам пока нужен только первый)
export async function getSets() {
  return request<{ id: string; title: string; taskCount: number }[]>(
    `${BASE_URL}/sets`
  );
}

// 2. Получить конкретный модуль (с заданиями)
export async function getSet(id: string) {
  return request<TrainingSet>(`${BASE_URL}/sets/${id}`);
}

// 3. Создать попытку
export async function createAttempt(setId: string) {
  return request<Attempt>(`${BASE_URL}/attempts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ setId }),
  });
}

// 4. Восстановить попытку (для перезагрузки страницы)
export async function getAttempt(id: string) {
  return request<Attempt>(`${BASE_URL}/attempts/${id}`);
}

// 5. Сохранить ответ (PUT)
export async function saveAnswer(
  attemptId: string, 
  answer: Answer, 
  extraHeaders?: Record<string, string>
) {
  return request<Attempt>(
    `${BASE_URL}/attempts/${attemptId}/answers/${answer.taskId}`,
    {
      method: "PUT",
      headers: getHeaders(extraHeaders),
      body: JSON.stringify(answer),
    }
  );
}

// 6. Удалить ответ (DELETE)
export async function deleteAnswer(
  attemptId: string, 
  taskId: string, 
  extraHeaders?: Record<string, string>
) {
  return request<Attempt>(
    `${BASE_URL}/attempts/${attemptId}/answers/${taskId}`,
    {
      method: "DELETE",
      headers: getHeaders(extraHeaders),
    }
  );
}

// 7. Завершить попытку (Submit)
export async function submitAttempt(
  attemptId: string, 
  extraHeaders?: Record<string, string>
) {
  return request<Result>(
    `${BASE_URL}/attempts/${attemptId}/submit`,
    {
      method: "POST",
      headers: getHeaders(extraHeaders),
      body: JSON.stringify({}),
    }
  );
}

// 8. Получить результат попытки
export async function getResult(attemptId: string) {
  return request<Result>(
    `${BASE_URL}/attempts/${attemptId}/result`
  );
}