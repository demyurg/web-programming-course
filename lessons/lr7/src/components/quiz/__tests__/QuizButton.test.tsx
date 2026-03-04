import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { act } from '@testing-library/react'
import QuizButton from '../QuizButton'
import { useUIStore } from '../../../stores/uiStore'

describe('QuizButton', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.setState({ theme: 'light' })
    })
  })

  it('should render button with text', () => {
    render(<QuizButton onClick={() => {}}>Click me</QuizButton>) // проверка создаются ли кнопки с значением
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => { //отслеживание состояний
    const handleClick = vi.fn()
    const user = userEvent.setup() // копия объекта юзера

    render(<QuizButton onClick={handleClick}>Click me</QuizButton>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1) // сколько раз в отслеживании было зафиксировано нажатий
  })

  it('should not call onClick when disabled', async () => { //рендерим неактивную кнопку
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<QuizButton onClick={handleClick} disabled>Click me</QuizButton>)
    await user.click(screen.getByRole('button')) //тыкаем на нее

    expect(handleClick).not.toHaveBeenCalled()  //для прохождения теста в отслеж состоян должно быть пусто так как кнопка неактив
  })
})
