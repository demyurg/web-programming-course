import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Theme } from "../types/quiz";

/**
 * UIStore - Zustand Store для управления UI состоянием
 *
 * Используется в Task3 и Task4
 */

interface UIStore {
  // Состояние
  theme: Theme;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  fontSize: "small" | "medium" | "large";

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  resetSettings: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      theme: "light",
      soundEnabled: true,
      animationsEnabled: true,
      fontSize: "medium",

      // Actions
      setTheme: (theme: Theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),

      toggleAnimations: () =>
        set((state) => ({
          animationsEnabled: !state.animationsEnabled,
        })),

      setFontSize: (fontSize: "small" | "medium" | "large") =>
        set({ fontSize }),

      resetSettings: () =>
        set({
          theme: "light",
          soundEnabled: true,
          animationsEnabled: true,
          fontSize: "medium",
        }),
    }),
    {
      name: "ui-storage", // ключ в localStorage
      // Опционально: можно указать какие поля сохранять
      partialize: (state) => ({
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        animationsEnabled: state.animationsEnabled,
        fontSize: state.fontSize,
      }),
    }
  )
);
