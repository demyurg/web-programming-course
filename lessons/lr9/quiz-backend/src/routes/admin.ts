import { Hono } from 'hono'
import { prisma } from '../db/prisma.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/admin.js'
import { QuestionSchema, GradeSchema } from '../utils/validation.js'

const adminRoute = new Hono()

// GET questions (with answers count)
adminRoute.get('/questions', authMiddleware, adminMiddleware, async (c) => {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      text: true,
      type: true,
      points: true,
      createdAt: true,
      _count: {
        select: {
          answers: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return c.json({ questions })
})

// POST create question
adminRoute.post('/questions', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json()

  const parsed = QuestionSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400)
  }

  const question = await prisma.question.create({
    data: parsed.data,
  })

  return c.json({ question }, 201)
})

// PUT update question
adminRoute.put('/questions/:id', authMiddleware, adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const parsed = QuestionSchema.partial().safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400)
  }

  const question = await prisma.question.update({
    where: { id },
    data: parsed.data,
  })

  return c.json({ question })
})