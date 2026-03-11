import { Hono } from 'hono'
import { prisma } from '../db/prisma.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/admin.js'
import { QuestionSchema, GradeSchema } from '../utils/validation.js'

const adminRoute = new Hono()

// GET /api/admin/questions - получить все вопросы с count ответов
adminRoute.get('/questions', authMiddleware, adminMiddleware, async (c) => {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      text: true,
      type: true,
      points: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true
        }
      },
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

// POST /api/admin/questions - создать новый вопрос
adminRoute.post('/questions', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json()

  const parsed = QuestionSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400)
  }

  // Проверяем существование категории
  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId }
  })

  if (!category) {
    return c.json({ error: 'Category not found' }, 400)
  }

  const question = await prisma.question.create({
    data: parsed.data,
  })

  return c.json({ question }, 201)
})

// PUT /api/admin/questions/:id - обновить вопрос
adminRoute.put('/questions/:id', authMiddleware, adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  // Проверяем существование вопроса
  const existingQuestion = await prisma.question.findUnique({
    where: { id }
  })

  if (!existingQuestion) {
    return c.json({ error: 'Question not found' }, 404)
  }

  const parsed = QuestionSchema.partial().safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400)
  }

  // Если меняется категория, проверяем её существование
  if (parsed.data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId }
    })

    if (!category) {
      return c.json({ error: 'Category not found' }, 400)
    }
  }

  const question = await prisma.question.update({
    where: { id },
    data: parsed.data,
  })

  return c.json({ question })
})

// GET /api/admin/answers/pending - получить essay ответы для проверки
adminRoute.get('/answers/pending', authMiddleware, adminMiddleware, async (c) => {
  const answers = await prisma.answer.findMany({
    where: {
      score: null,
      question: {
        type: 'essay'
      }
    },
    include: {
      question: {
        select: {
          id: true,
          text: true,
          points: true
        }
      },
      session: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 50 // ограничиваем количество
  })

  return c.json({ answers })
})

// POST /api/admin/answers/:id/grade - выставить оценку за essay
adminRoute.post('/answers/:id/grade', authMiddleware, adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const parsed = GradeSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400)
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Получаем ответ
      const answer = await tx.answer.findUnique({
        where: { id },
        include: {
          question: true,
          session: {
            include: {
              answers: true
            }
          }
        }
      })

      if (!answer) {
        throw new Error('Answer not found')
      }

      if (answer.question.type !== 'essay') {
        throw new Error('Only essay answers can be graded manually')
      }

      if (answer.score !== null) {
        throw new Error('Answer already graded')
      }

      // Обновляем ответ
      const updatedAnswer = await tx.answer.update({
        where: { id },
        data: {
          score: parsed.data.score,
          isCorrect: parsed.data.score > 0
        }
      })

      // Проверяем, все ли ответы в сессии оценены
      const allGraded = answer.session.answers.every(a => a.score !== null || a.id === id)

      if (allGraded) {
        const totalScore = answer.session.answers.reduce(
          (sum, a) => sum + (a.id === id ? parsed.data.score : (a.score || 0)),
          0
        )

        await tx.session.update({
          where: { id: answer.sessionId },
          data: {
            score: totalScore,
            status: 'completed'
          }
        })
      }

      return updatedAnswer
    })

    return c.json({ answer: result })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// GET /api/admin/students/:userId/stats - статистика студента
adminRoute.get('/students/:userId/stats', authMiddleware, adminMiddleware, async (c) => {
  const { userId } = c.req.param()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const sessions = await prisma.session.findMany({
    where: { userId },
    include: {
      _count: {
        select: { answers: true }
      }
    },
    orderBy: { startedAt: 'desc' }
  })

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const avgScore = completedSessions.length
    ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
    : 0

  return c.json({
    user,
    stats: {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      averageScore: Math.round(avgScore * 100) / 100,
      totalAnswers: sessions.reduce((sum, s) => sum + s._count.answers, 0)
    },
    sessions: sessions.map(s => ({
      id: s.id,
      status: s.status,
      score: s.score,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      answersCount: s._count.answers
    }))
  })
})

export default adminRoute