import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PrismockClient } from 'prismock'
import { SessionService } from '../sessionService'

describe('SessionService with Prismock', () => {
    let sessionService: SessionService
    let prismock: any // Используем any - это проще всего

    beforeEach(async () => {
        // Создаем новый экземпляр prismock для каждого теста
        prismock = new PrismockClient()

        // Очищаем все таблицы
        await prismock.answer.deleteMany()
        await prismock.session.deleteMany()
        await prismock.question.deleteMany()
        await prismock.category.deleteMany()
        await prismock.user.deleteMany()

        // Создаем тестового пользователя
        await prismock.user.create({
            data: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                githubId: 'github-123',
                role: 'student'
            }
        })

        // Создаем тестовую категорию
        const category = await prismock.category.create({
            data: {
                id: 'cat-123',
                name: 'Тестовая категория',
                slug: 'test-category'
            }
        })

        // Создаем тестовые вопросы
        await prismock.question.createMany({
            data: [
                {
                    id: 'q-multi-1',
                    text: 'Сколько будет 2 + 2?',
                    type: 'multiple-select',
                    categoryId: category.id,
                    correctAnswer: ['4'],
                    points: 5
                },
                {
                    id: 'q-essay-1',
                    text: 'Что такое REST API?',
                    type: 'essay',
                    categoryId: category.id,
                    correctAnswer: {
                        definition: 5,
                        methods: 3,
                        examples: 2
                    },
                    points: 10
                }
            ]
        })

        // Создаем сервис с prismock
        sessionService = new SessionService(prismock)
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.useRealTimers()
    })

    it('создает сессию', async () => {
        const session = await sessionService.createSession('user-123')
        expect(session).toBeDefined()
        expect(session.userId).toBe('user-123')
    })
})