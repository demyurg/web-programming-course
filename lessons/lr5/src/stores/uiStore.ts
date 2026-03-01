import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Theme } from "../types/quiz";

interface UIStore {
  theme: Theme;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  fontSize: "small" | "medium" | "large";

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
      theme: "light",
      soundEnabled: true,
      animationsEnabled: true,
      fontSize: "medium",

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
      name: "ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        animationsEnabled: state.animationsEnabled,
        fontSize: state.fontSize,
      }),
    }
  )
);