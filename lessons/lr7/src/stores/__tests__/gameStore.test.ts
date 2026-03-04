import { describe, it, expect, beforeEach } from 'vitest'
import { GameStore } from '../gameStore'
import { mockQuestions } from '../../test/mockData'
// тест по хранилищу
describe('GameStore', () => {
  let store: GameStore

  beforeEach(() => {
    store = new GameStore()
  })

  it('should initialize with default values', () => { //проверка значений по умолчанию (до начала прохождения всё пусто)
    expect(store.gameStatus).toBe('idle')
    expect(store.questions).toEqual([])
    expect(store.score).toBe(0)
    expect(store.selectedAnswers).toEqual([])
  })

  it('should start game and reset state', () => { //запуск игры и сброс состояния
    store.score = 100 //храним значечения типа прошлой игры
    store.selectedAnswers = [0, 1]

    store.startGame() // запуск игры

    expect(store.gameStatus).toBe('playing') //проверка состояний
    expect(store.score).toBe(0)
    expect(store.selectedAnswers).toEqual([])
  })

  it('should toggle answer selection', () => { //проверка на то что при повторном нажатии ответ отменяетсч
    store.toggleAnswer(0) //переключаем ответ 
    expect(store.selectedAnswers).toEqual([0])

    store.toggleAnswer(0)
    expect(store.selectedAnswers).toEqual([])
  })


  it('should save correct answer', () => {
    store.setQuestionsFromAPI(mockQuestions) // берем вопрос
    store.toggleAnswer(0) // Правильный ответ 
    store.saveCurrentAnswer() //сохраняем ответ\\

    expect(store.answeredQuestions).toHaveLength(1) //проверяем сколько хранится ответов
    expect(store.answeredQuestions[0].isCorrect).toBe(true) //проверяем правильные ли они
  })

})
