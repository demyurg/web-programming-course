export type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export const ATTEMPT_ID_KEY = "trainer.attemptId";

export function saveAttemptId(id: string): void {
  localStorage.setItem(ATTEMPT_ID_KEY, id);
}

export function readAttemptId(): string | null {
  return localStorage.getItem(ATTEMPT_ID_KEY);
}

export function clearAttemptId(): void {
  localStorage.removeItem(ATTEMPT_ID_KEY);
}