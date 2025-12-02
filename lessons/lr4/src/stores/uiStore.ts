import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  soundEnabled: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Начальное состояние
      theme: 'light',
      soundEnabled: true,

      // Actions
      setTheme: (theme) => set({ theme }),

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),

      toggleSound: () => set((state) => ({
        soundEnabled: !state.soundEnabled
      })),
    }),
    {
      name: 'ui-storage', // Имя ключа в localStorage
    }
  )
);