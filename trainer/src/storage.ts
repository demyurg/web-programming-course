export type AttemptRef = { setId: string; attemptId: string };

const REF_KEY = "trainer-submitted-attempt";

export function readAttemptRef(): AttemptRef | null {
  try {
    const raw = localStorage.getItem(REF_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.setId !== "string" || typeof obj.attemptId !== "string")
      return null;
    return { setId: obj.setId, attemptId: obj.attemptId };
  } catch {
    return null;
  }
}

export function writeAttemptRef(ref: AttemptRef): void {
  try {
    localStorage.setItem(REF_KEY, JSON.stringify(ref));
  } catch {
    // указатель не критичен: без него просто не восстановим обзор после перезагрузки
  }
}

export function clearAttemptRef(): void {
  try {
    localStorage.removeItem(REF_KEY);
  } catch {
    // игнорируем
  }
}
