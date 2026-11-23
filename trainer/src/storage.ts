import type { Draft } from "./domain.js";

const STORAGE_KEY_PREFIX = "trainer-draft-";

export function getStorageKey(setId: string): string {
  return `${STORAGE_KEY_PREFIX}${setId}`;
}

export function readDraft(raw: string | null, expectedSetId: string): Draft | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    
    // Проверка версии
    if (obj.version !== 1) return null;
    // Проверка setId
    if (obj.setId !== expectedSetId) return null;
    // Проверка taskId
    if (typeof obj.taskId !== "string") return null;
    // Проверка status
    if (obj.status !== "in-progress" && obj.status !== "submitted") return null;
    // Проверка answers
    if (!Array.isArray(obj.answers)) return null;
    const answers = obj.answers as unknown[];
    for (const answer of answers) {
      if (typeof answer !== "object" || answer === null) return null;
      const a = answer as Record<string, unknown>;
      if (typeof a.taskId !== "string") return null;
      if (a.kind !== "single-choice" && a.kind !== "short-text") return null;
      if (a.kind === "single-choice" && typeof a.optionId !== "string") return null;
      if (a.kind === "short-text" && typeof a.text !== "string") return null;
    }

    return {
      version: 1,
      setId: obj.setId as string,
      taskId: obj.taskId as string,
      answers: answers as Draft["answers"],
      status: obj.status as Draft["status"],
    };
  } catch {
    return null;
  }
}

export function writeDraft(key: string, draft: Draft): void {
  localStorage.setItem(key, JSON.stringify(draft));
}

export function clearDraft(key: string): void {
  localStorage.removeItem(key);
}