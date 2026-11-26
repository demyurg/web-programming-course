const STORAGE_KEY_PREFIX = "draft-";

// Генерирует ключ хранилища для конкретного набора заданий.
export function getStorageKey(setId: string): string {
  return `${STORAGE_KEY_PREFIX}${setId}`;
}