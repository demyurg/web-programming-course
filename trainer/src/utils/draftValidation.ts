import type { Answer } from "../domain/domain.js";

// Формат черновика для localStorage 
export type Draft = {
  version: 1;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: "in-progress" | "submitted";
};

// Внутреннее состояние экрана попытки 
export type AttemptState = {
  currentIndex: number;
  answers: Answer[];
  status: "in-progress" | "submitted";
  storageWarning?: string;
};

// Типы действий для useReducer 
export type AttemptAction =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerRemoved"; taskId: string }
  | { type: "moved"; index: number }
  | { type: "reset" }
  | { type: "restored"; draft: Draft }
  | { type: "submitted" };

//Безопасная валидация черновика из хранилища. Проверяет структуру, версию, setId и статус перед возвратом.

export function readDraft(raw: string | null, expectedSetId: string): Draft | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      !("setId" in parsed) ||
      !("answers" in parsed) ||
      !("status" in parsed)
    ) {
      throw new Error("Invalid structure");
    }
    const draft = parsed as Draft;
    if (draft.version !== 1) return null;
    if (draft.setId !== expectedSetId) return null;
    if (draft.status !== "in-progress" && draft.status !== "submitted") {
      return null;
    }
    if (!Array.isArray(draft.answers)) return null;
    return draft;
  } catch {
    return null;
  }
}