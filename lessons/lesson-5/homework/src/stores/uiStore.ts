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
  soundEnabled: boolean;
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
}

// Валидация темы при загрузке из localStorage
const validateTheme = (theme: unknown): Theme => {
  return theme === 'light' || theme === 'dark' ? theme : 'light';
};

// Валидация звука при загрузке из localStorage
const validateSound = (sound: unknown): boolean => {
  return typeof sound === 'boolean' ? sound : true;
};

// Создаем store с помощью create<UIStore>()
// Обернули в persist middleware для автосохранения в localStorage
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      theme: 'light',
      soundEnabled: true,

      // Actions
      setTheme: (theme: Theme) => {
        set({ theme });
      },

      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),

      toggleSound: () => set((state) => ({ 
        soundEnabled: !state.soundEnabled 
      })),
    }),
    {
      name: 'ui-storage', // ключ в localStorage
      version: 1, // версия для миграций
      // Обработка ошибок при загрузке из localStorage
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            // Валидируем данные при загрузке
            return {
              ...parsed,
              state: {
                ...parsed.state,
                theme: validateTheme(parsed.state?.theme),
                soundEnabled: validateSound(parsed.state?.soundEnabled),
              }
            };
          } catch (error) {
            console.warn('Error loading UI store from localStorage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.warn('Error saving UI store to localStorage:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.warn('Error removing UI store from localStorage:', error);
          }
        },
      },
      // Миграция для будущих версий
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Пример миграции с версии 0 на версию 1
          return {
            ...persistedState,
            theme: validateTheme(persistedState.theme),
            soundEnabled: validateSound(persistedState.soundEnabled),
          };
        }
        return persistedState;
      },
    }
  )
);

// Вспомогательные хуки для удобства
export const useTheme = () => useUIStore((state) => state.theme);
export const useSoundEnabled = () => useUIStore((state) => state.soundEnabled);
export const useThemeActions = () => useUIStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
}));
export const useSoundActions = () => useUIStore((state) => ({
  toggleSound: state.toggleSound,
}));