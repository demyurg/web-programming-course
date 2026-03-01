import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types/quiz';

/**
 * UIStore - Zustand Store для управления UI состоянием
 *
 * Используется в Task3 и Task4
 */

interface UIStore {
  // === Состояние ===
  theme: Theme;                // светлая / тёмная тема
  soundEnabled: boolean;       // звук включен / выключен
  activeModal: string | null;  // имя открытого модального окна (Task4)

  // === Действия ===
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;

  // Управление модальными окнами (Task4)
  openModal: (name: string) => void;
  closeModal: () => void;
}

// === Реализация store ===
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Начальное состояние
      theme: 'light',
      soundEnabled: true,
      activeModal: null,

      // === Actions ===
      setTheme: (theme: Theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),

      openModal: (name: string) => set({ activeModal: name }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'ui-storage', // ключ в localStorage
    }
  )
);