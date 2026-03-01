import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types/quiz';

interface UIStore {
  // Состояние
  theme: Theme;
  soundEnabled: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Начальное состояние
      theme: "light",
      soundEnabled: true,

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
    }),
    {
      name: "ui-storage", // ключ в localStorage
    },
  ),
);