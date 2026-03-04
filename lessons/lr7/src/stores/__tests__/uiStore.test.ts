import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../uiStore'
import { act } from '@testing-library/react'
// хранилище интерфейса
describe('UIStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should have initial state', () => { //проверка инициализации темы
    const { theme } = useUIStore.getState()
    expect(['light', 'dark']).toContain(theme)
  })

  it('should set theme', () => {
    act(() => {
      useUIStore.getState().setTheme('dark') //должна установиться тема проверка
    })

    expect(useUIStore.getState().theme).toBe('dark')
  })

  it('should toggle theme', () => {
    act(() => {
      useUIStore.getState().setTheme('light') // проверка меняется ли тема
    })

    act(() => {
      useUIStore.getState().toggleTheme()
    })
    expect(useUIStore.getState().theme).toBe('dark')

    act(() => {
      useUIStore.getState().toggleTheme()
    })
    expect(useUIStore.getState().theme).toBe('light')
  })

})
