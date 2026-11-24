import { fetchAttempt, fetchResult, HttpError, loadModule } from "./api/trainerApi";
import type { Attempt, Result } from "./attempt";
import type { TrainingSet } from "./domain";

const attemptIdKey = "web-programming-course:trainer:attemptId";

export type Session = {
  set: TrainingSet;
  attempt: Attempt | null;
  result: Result | null;
  notice: string | null;
};

export async function loadSession(): Promise<Session | null> {
  const set = await loadModule();
  if (!set) return null;

  let attemptId: string | null;
  try {
    attemptId = window.localStorage.getItem(attemptIdKey);
  } catch {
    return { set, attempt: null, result: null, notice: "Хранилище браузера недоступно. Восстановить попытку нельзя." };
  }
  if (!attemptId || !/^[A-Za-z0-9_-]+$/.test(attemptId)) {
    return { set, attempt: null, result: null, notice: "Нет сохранённого идентификатора. Восстановить попытку нельзя." };
  }

  let attempt: Attempt;
  try {
    attempt = await fetchAttempt(set, attemptId);
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 404) throw error;
    return { set, attempt: null, result: null, notice: "Сохранённая попытка больше не найдена на сервере. Начните новую попытку." };
  }
  const result = attempt.status === "submitted" ? await fetchResult(set, attempt.id) : null;
  return { set, attempt, result, notice: "Подтверждённая попытка восстановлена с сервера." };
}

export function storeAttemptId(attemptId: string): boolean {
  try {
    window.localStorage.setItem(attemptIdKey, attemptId);
    return true;
  } catch {
    return false;
  }
}
