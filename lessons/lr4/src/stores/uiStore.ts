import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types/quiz';

interface UIStore {
  theme: Theme;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  fontSize: number;
  
  // Модальные окна
  showStatsModal: boolean;
  showSettingsModal: boolean;
  showHelpModal: boolean;

  // Actions для темы и звука
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  
  // Actions для модальных окон
  openStatsModal: () => void;
  closeStatsModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openHelpModal: () => void;
  closeHelpModal: () => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      soundEnabled: true,
      notificationsEnabled: true,
      fontSize: 16,
      
      // Модальные окна - начальное состояние
      showStatsModal: false,
      showSettingsModal: false,
      showHelpModal: false,

      // Actions для темы и звука
      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
      increaseFontSize: () =>
        set((state) => ({
          fontSize: Math.min(state.fontSize + 2, 24),
        })),
      decreaseFontSize: () =>
        set((state) => ({
          fontSize: Math.max(state.fontSize - 2, 12),
        })),
      resetFontSize: () => set({ fontSize: 16 }),
      
      // Actions для модальных окон
      openStatsModal: () => set({ showStatsModal: true }),
      closeStatsModal: () => set({ showStatsModal: false }),
      openSettingsModal: () => set({ showSettingsModal: true }),
      closeSettingsModal: () => set({ showSettingsModal: false }),
      openHelpModal: () => set({ showHelpModal: true }),
      closeHelpModal: () => set({ showHelpModal: false }),
      closeAllModals: () => set({ 
        showStatsModal: false,
        showSettingsModal: false,
        showHelpModal: false 
      }),
    }),
    {
      name: 'ui-storage',
    }
  )
);