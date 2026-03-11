import { Hono } from 'hono'
import { prisma } from '../db/prisma.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { sessionService } from '../services/sessionService.js'
import { AnswerSchema } from '../utils/validation.js'

const sessionsRoute = new Hono()

// Create session
sessionsRoute.post('/', authMiddleware, async (c) => {
  const user = c.get('user')

  // считаем количество вопросов
  const totalQuestions = await prisma.question.count()

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  return c.json(
  {
    session,
    totalQuestions
  },
  201
)
})

// Submit answer (with validation)
sessionsRoute.post('/:id/answers', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const parsed = AnswerSchema.safeParse({
    ...body,
    sessionId: id,
  })

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400)
  }

  try {
    const answer = await sessionService.submitAnswer(
      id,
      parsed.data.questionId,
      parsed.data.userAnswer
    )

    return c.json({ answer })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// Get session
sessionsRoute.get('/:id', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      answers: {
        include: { question: true },
      },
    },
  })

  if (!session) return c.json({ error: 'Not found' }, 404)
  if (session.userId !== user.id)
    return c.json({ error: 'Forbidden' }, 403)

  return c.json({ session })
})

// Submit session
sessionsRoute.post('/:id/submit', authMiddleware, async (c) => {
  const { id } = c.req.param()

  if (!id) {
    return c.json({ error: 'Invalid id' }, 400)
  }

  try {
    const session = await sessionService.submitSession(id)
    return c.json({ session })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

export default sessionsRoute