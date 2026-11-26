import type { ApiError } from "../model/apiTypes";

// Базовая функция для всех запросов
export async function request<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    // 1. Проверяем HTTP-статус (response.ok проверяет, что статус 200-299)
    if (!response.ok) {
      // Пытаемся прочитать ошибку от сервера, если она есть в формате JSON
      let errorMessage = `HTTP ошибка: ${response.status}`;
      try {
        const errorData = (await response.json()) as ApiError;
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Если тело не JSON, оставляем стандартное сообщение
      }
      throw new Error(errorMessage);
    }

    // 2. Если статус ок, читаем JSON. (Если тело пустое, вернется null, это нормально для DELETE)
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
    
  } catch (error) {
    // Ловим сетевые ошибки (например, сервер выключен)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Не удалось соединиться с сервером. Проверьте, запущен ли он.");
    }
    throw error; // Пробрасываем ошибку дальше (ее поймает UI)
  }
}