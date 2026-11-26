
import type { Draft } from "./attempt";

export const DRAFT_STORAGE_KEY = "trainer.attempt.v1";

export type StorageResult<T = void> =
  | { ok: true; value: T }
  | { ok: false };

function useStorage<T>(
  action: (storage: Storage) => T
): StorageResult<T> {
  try {
    if (typeof window === "undefined") {
      return { ok: false };
    }

    return {
      ok: true,
      value: action(window.localStorage),
    };
  } catch {
    return { ok: false };
  }
}

export function readDraftRaw(): StorageResult<string | null> {
  return useStorage(storage => storage.getItem(DRAFT_STORAGE_KEY));
}

export function writeDraft(draft: Draft): StorageResult {
  return useStorage(storage => {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  });
}

export function removeDraft(): StorageResult {
  return useStorage(storage => {
    storage.removeItem(DRAFT_STORAGE_KEY);
  });
}
