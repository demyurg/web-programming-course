import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { sessionService } from '../services/sessionService.js'

const prisma = new PrismaClient()
const sessions = new Hono()

// POST /api/sessions - начать сессию
sessions.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { userId } = body

    if (!userId) {
      return c.json({ error: 'userId обязателен' }, 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return c.json({ error: 'Пользователь не найден' }, 404)
    }

    const questionsCount = await prisma.question.count()
    if (questionsCount === 0) {
      return c.json({ error: 'Нет доступных вопросов' }, 400)
    }

    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 час
      },
      include: { user: true }
    })

    return c.json({ session }, 201)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Внутренняя ошибка сервера' }, 500)
  }
})

// GET /api/sessions/:id - получить сессию
sessions.get('/:id', async (c) => {
  try {
    const sessionId = c.req.param('id')
    const userId = c.req.header('X-User-Id')

    if (!userId) {
      return c.json({ error: 'Не авторизован' }, 401)
    }

    const session = await sessionService.getSessionWithAnswers(sessionId, userId)
    return c.json({ session })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return c.json({ error: message }, 400)
  }
})

// POST /api/sessions/:id/answers - отправить ответ
sessions.post('/:id/answers', async (c) => {
  try {
    const sessionId = c.req.param('id')
    const body = await c.req.json()
    const { questionId, userAnswer } = body

    if (!questionId) {
      return c.json({ error: 'questionId обязателен' }, 400)
    }

    if (userAnswer === undefined) {
      return c.json({ error: 'userAnswer обязателен' }, 400)
    }

    const answer = await sessionService.submitAnswer({
      sessionId,
      questionId,
      userAnswer
    })

    return c.json({ answer }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return c.json({ error: message }, 400)
  }
})

// POST /api/sessions/:id/submit - завершить сессию
sessions.post('/:id/submit', async (c) => {
  try {
    const sessionId = c.req.param('id')
    const session = await sessionService.submitSession(sessionId)
    return c.json({ session })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return c.json({ error: message }, 400)
  }
})

export default sessions