import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme, ModalType } from '../types/quiz'

interface UIStore {
  theme: Theme
  soundEnabled: boolean
  openModal: ModalType

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleSound: () => void
  setOpenModal: (modal: ModalType) => void
  closeModal: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    set => ({
      theme: 'light',
      soundEnabled: true,
      openModal: null,

      setTheme: (theme: Theme) => set({ theme }),

      toggleTheme: () =>
        set(state => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      toggleSound: () =>
        set(state => ({
          soundEnabled: !state.soundEnabled,
        })),

      setOpenModal: (modal: ModalType) => set({ openModal: modal }),

      closeModal: () => set({ openModal: null }),
    }),
    {
      name: 'ui-storage',
    },
  ),
)
