import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types/quiz';

/**
 * UIStore - Zustand Store для управления UI состоянием
 *
 * Используется в Task3 и Task4
 */

interface UIStore {
  // Состояние
  theme: Theme;
  // TODO: Добавьте другие UI-состояния (soundEnabled)
  soundEnabled: boolean;

  // task4
  activeModal: string | null;
  
  // Actions
  setTheme: (theme: Theme) => void;
  // TODO: Добавьте другие actions (toggleTheme, toggleSound)
  toggleTheme: () => void;
  toggleSound: () => void;

  // task4
  openModal: (name: string) => void;
  closeModal: () => void;
}

// TODO: Создайте store с помощью create<UIStore>()
// Оберните в persist middleware для автосохранения в localStorage
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Начальное состояние
      theme: 'light', // TODO: Добавьте другие поля (soundEnabled и т.д.)
      soundEnabled: true,
      activeModal: null,

      // Actions
      setTheme: (theme: Theme) => set({ theme }),      

      // TODO: Добавьте другие actions
      //   toggleTheme: () => set((state) => ...,
      toggleTheme: () => set((state) => ({theme: state.theme === 'light' ? 'dark' : 'light'})),

      // Пример toggleSound:
      //   toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleSound: () => set((state) => ({soundEnabled: !state.soundEnabled})),

      // task4
      openModal: (name: string) => set({activeModal: name}),
      closeModal: () => set({activeModal: null})
    }),
    {
      name: 'ui-storage', // ключ в localStorage
    }
  )
);
