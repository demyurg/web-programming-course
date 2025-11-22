/**
 * src/stores/uiStore.ts
 * Zustand UI Store — ГОТОВО И БЕЗ ОШИБОК!
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Определяем тип темы
type Theme = "light" | "dark";

interface UIStore {
  theme: Theme;
  soundEnabled: boolean; // ← ДОБАВЛЕНО!

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void; // ← ДОБАВЛЕНО!
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "light",
      soundEnabled: true, // ← ДОБАВЛЕНО!

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled, // ← ДОБАВЛЕНО!
        })),
    }),
    {
      name: "ui-storage", // сохраняется в localStorage
    }
  )
);
