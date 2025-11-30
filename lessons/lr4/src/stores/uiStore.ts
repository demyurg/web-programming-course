import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme } from '../types/quiz'

/**
 * UIStore - Zustand Store для управления UI состоянием
 *
 * Используется в Task3 и Task4
 */

interface UIStore {
	// Состояние
	theme: Theme
	// TODO: Добавьте другие UI-состояния (soundEnabled)
	soundEnabled: boolean
	sidebarOpen: boolean

	modals: {
		settings: boolean
		statistics: boolean
		help: boolean
	}
	openModal: (modalName: keyof UIStore['modals']) => void
	closeModal: (modalName: keyof UIStore['modals']) => void
	closeAllModals: () => void

	// Actions
	setTheme: (theme: Theme) => void
	// TODO: Добавьте другие actions (toggleTheme, toggleSound)
	toggleTheme: () => void
	toggleSound: () => void
	setSoundEnabled: (enabled: boolean) => void
	toggleSidebar: () => void
	setSidebarOpen: (open: boolean) => void
}

// TODO: Создайте store с помощью create<UIStore>()
// Оберните в persist middleware для автосохранения в localStorage
export const useUIStore = create<UIStore>()(
	persist(
		set => ({
			// Начальное состояние
			theme: 'light', // TODO: Добавьте другие поля (soundEnabled и т.д.)
			soundEnabled: true,
			sidebarOpen: false,
			modals: {
				settings: false,
				statistics: false,
				help: false,
			},
			// Actions
			setTheme: (theme: Theme) => set({ theme }),

			// TODO: Добавьте другие actions
			toggleTheme: () =>
				set(state => ({
					theme: state.theme === 'light' ? 'dark' : 'light',
				})),

			toggleSound: () =>
				set(state => ({
					soundEnabled: !state.soundEnabled,
				})),

			setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),

			toggleSidebar: () =>
				set(state => ({
					sidebarOpen: !state.sidebarOpen,
				})),

			setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

			openModal: (modalName: keyof UIStore['modals']) =>
				set(state => ({
					modals: { ...state.modals, [modalName]: true },
				})),

			closeModal: (modalName: keyof UIStore['modals']) =>
				set(state => ({
					modals: { ...state.modals, [modalName]: false },
				})),

			closeAllModals: () =>
				set({
					modals: { settings: false, statistics: false, help: false },
				}),
		}),
		{
			name: 'ui-storage', // ключ в localStorage
			partialize: state => ({
				theme: state.theme,
				soundEnabled: state.soundEnabled,
			}), // Сохраняем только важные настройки
		}
	)
)
