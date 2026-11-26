const KEY = "trainer.attemptId";

export function readSavedAttemptId(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveAttemptId(id: string): void {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
  }
}

export function clearSavedAttemptId(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
  }
}
