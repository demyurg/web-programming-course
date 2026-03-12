/// <reference types="node" />
import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { prisma } from '../lib/prisma.js'
import { ServiceError, sessionService } from '../services/sessionService.js'
import {
  AnswerSchema,
  CreateSessionSchema,
  SubmitSessionSchema,
} from '../utils/validation.js'

const sessionsRoutes = new Hono({ strict: false })

const JWT_SECRET: string = (() => {
  const v = process.env.JWT_SECRET
  if (!v) throw new Error('JWT_SECRET is not set in .env')
  return v
})()

function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

async function getUserIdFromRequest(authHeader?: string): Promise<string | null> {
  const token = getBearerToken(authHeader)
  if (!token) return null

  try {
    const payload = (await verify(token, JWT_SECRET, 'HS256')) as Record<string, unknown>
    return typeof payload.userId === 'string' ? payload.userId : null
  } catch {
    return null
  }
}

sessionsRoutes.post('/', async (c) => {
  const userId = await getUserIdFromRequest(c.req.header('Authorization'))
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json().catch(() => ({}))
  const parsed = CreateSessionSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const { categoryId } = parsed.data

  const questionCount = await prisma.question.count({
    where: categoryId ? { categoryId } : undefined,
  })

  if (questionCount === 0) {
    return c.json({ error: 'No questions found for this quiz/category' }, 400)
  }

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  return c.json({
    session,
    questionCount,
  })
})

sessionsRoutes.get('/:id', async (c) => {
  const userId = await getUserIdFromRequest(c.req.header('Authorization'))
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const { id } = c.req.param()

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      answers: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              points: true,
            },
          },
        },
      },
    },
  })

  if (!session) return c.json({ error: 'Session not found' }, 404)
  if (session.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  return c.json({ session })
})

sessionsRoutes.post('/:id/answers', async (c) => {
  const userId = await getUserIdFromRequest(c.req.header('Authorization'))
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const { id: sessionId } = c.req.param()

  const body = await c.req.json().catch(() => null)
if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = AnswerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  if (parsed.data.sessionId && parsed.data.sessionId !== sessionId) {
    return c.json({ error: 'sessionId in body does not match path id' }, 400)
  }

  try {
    const answer = await sessionService.submitAnswer(
      sessionId,
      parsed.data.questionId,
      parsed.data.userAnswer,
      userId
    )
    return c.json({ answer })
  } catch (error) {
    if (error instanceof ServiceError) {
      return c.json({ error: error.message }, error.status as 400 | 401 | 403 | 404)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

sessionsRoutes.post('/:id/submit', async (c) => {
  const userId = await getUserIdFromRequest(c.req.header('Authorization'))
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const { id: sessionId } = c.req.param()

  const body = await c.req.json().catch(() => null)
if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

const parsed = SubmitSessionSchema.safeParse(body)
if (!parsed.success) {
  return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
}

  try {
    const session = await sessionService.submitSession(sessionId, userId)
    return c.json({ session })
  } catch (error) {
    if (error instanceof ServiceError) {
      return c.json({ error: error.message }, error.status as 400 | 401 | 403 | 404)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default sessionsRoutes