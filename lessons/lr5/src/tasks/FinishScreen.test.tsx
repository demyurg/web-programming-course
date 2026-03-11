import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FinishScreen } from './FinishScreen'

// Группа тестов для компонента FinishScreen
describe('FinishScreen', () => {
	it('renders score and percentage', () => {
		render(
			<FinishScreen
				theme='light'
				score={80}
				correctAnswers={4}
				totalQuestions={5}
				onRestart={vi.fn()}
			/>,
		)

		// Проверяем, что отображается заголовок
		expect(screen.getByText('Игра завершена!')).toBeInTheDocument()
		expect(screen.getByText('80')).toBeInTheDocument()
		expect(screen.getByText(/4\s*из\s*5/)).toBeInTheDocument()
		expect(screen.getByText('80%')).toBeInTheDocument()
	})

	// Второй тест — проверяет работу кнопки "Играть снова"
	it('calls onRestart when restart button clicked', () => {
		const mockRestart = vi.fn()

		// Рендерим компонент
		render(
			<FinishScreen
				theme='light'
				score={50}
				correctAnswers={2}
				totalQuestions={5}
				onRestart={mockRestart}
			/>,
		)

		// Симулируем клик по кнопке
		fireEvent.click(screen.getByText('Играть снова'))

		// Проверяем, что функция была вызвана один раз
		expect(mockRestart).toHaveBeenCalledTimes(1)
	})
})
