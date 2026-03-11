import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StartScreen } from './StartScreen'

// Импорт функций тестового фреймворка Vitest
describe('StartScreen', () => {
	it('renders title and start button', () => {
		render(
			<StartScreen
				theme='light'
				soundEnabled={true}
				toggleTheme={vi.fn()}
				onStart={vi.fn()}
			/>,
		)

		// Проверяем, что заголовок отображается
		expect(screen.getByText('Quiz Game')).toBeInTheDocument()
		expect(screen.getByText('Начать игру')).toBeInTheDocument()
	})

	// Тест проверяет работу кнопки "Начать игру"
	it('calls onStart when start button is clicked', () => {
		const mockStart = vi.fn()

		render(
			<StartScreen
				theme='light'
				soundEnabled={true}
				toggleTheme={vi.fn()}
				onStart={mockStart}
			/>,
		)

		// Имитируем клик по кнопке смены темы (иконка 🌙)
		fireEvent.click(screen.getByText('Начать игру'))

		// Проверяем, что функция переключения темы была вызвана
		expect(mockStart).toHaveBeenCalledTimes(1)
	})

	// Тест проверяет кнопку переключения темы
	it('calls toggleTheme when theme button clicked', () => {
		const mockToggle = vi.fn()

		render(
			<StartScreen
				theme='light'
				soundEnabled={true}
				toggleTheme={mockToggle}
				onStart={vi.fn()}
			/>,
		)

		// Имитируем клик по кнопке смены темы (иконка 🌙)
		fireEvent.click(screen.getByText('🌙'))

		// Проверяем, что функция переключения темы была вызвана
		expect(mockToggle).toHaveBeenCalled()
	})
})
