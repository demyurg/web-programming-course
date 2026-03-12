import { prisma } from '../lib/prisma.js'
import { scoringService } from './scoringService.js'

export class ServiceError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v))
  if (typeof value === 'string') return [value]
  return []
}

function toJson(value: unknown) {
  return value as any
}

class SessionService {
  async submitAnswer(sessionId: string, questionId: string, userAnswer: unknown, userId: string) {
    return prisma.$transaction(async (tx: any) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
      })

      if (!session) throw new ServiceError('Session not found', 404)
      if (session.userId !== userId) throw new ServiceError('Forbidden', 403)
      if (session.status === 'completed') throw new ServiceError('Session already completed', 400)

      if (session.expiresAt < new Date()) {
        await tx.session.update({
          where: { id: sessionId },
          data: { status: 'expired' },
        })
        throw new ServiceError('Session expired', 400)
      }

      const question = await tx.question.findUnique({
        where: { id: questionId },
      })

      if (!question) throw new ServiceError('Question not found', 404)

      let score: number | null = null
      let isCorrect: boolean | null = null

      if (question.type === 'essay') {
        score = null
        isCorrect = null
      } else if (question.type === 'single-select') {
        const correct = toStringArray(question.correctAnswer)[0]
        const student = toStringArray(userAnswer)[0]
        isCorrect = Boolean(correct && student && correct === student)
        score = isCorrect ? question.points : 0
      } else if (question.type === 'multiple-select') {
        const correct = toStringArray(question.correctAnswer)
        const student = toStringArray(userAnswer)

        const raw = scoringService.scoreMultipleSelect(correct, student)
        const maxRaw = Math.max(correct.length, 1)
        const normalized = (raw / maxRaw) * question.points

        score = Number(Math.max(0, normalized).toFixed(2))
        isCorrect =
          student.length === correct.length && student.every((ans) => correct.includes(ans))
      } else {
        throw new ServiceError('Unsupported question type', 400)
      }

      const answer = await tx.answer.upsert({
        where: {
          sessionId_questionId: { sessionId, questionId },
        },
        update: {
          userAnswer: toJson(userAnswer),
          score,
          isCorrect,
        },
        create: {
          sessionId,
          questionId,
          userAnswer: toJson(userAnswer),
          score,
          isCorrect,
        },
      })

      return answer
    })
  }

  async submitSession(sessionId: string, userId: string) {
    return prisma.$transaction(async (tx: any) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true },
      })

      if (!session) throw new ServiceError('Session not found', 404)
      if (session.userId !== userId) throw new ServiceError('Forbidden', 403)
      if (session.status === 'completed') throw new ServiceError('Session already completed', 400)

      if (session.expiresAt < new Date()) {
        const expired = await tx.session.update({
          where: { id: sessionId },
          data: { status: 'expired' },
          include: {
            answers: {
              include: {
                question: {
                  select: { id: true, text: true, type: true, points: true },
                },
              },
            },
          },
        })
        return expired
      }

      const totalScore = Number(
        session.answers
          .reduce((sum: number, a: { score: number | null }) => sum + (a.score ?? 0), 0)
          .toFixed(2)
      )

      const completed = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          score: totalScore,
        },
        include: {
          answers: {
            include: {
              question: {
                select: { id: true, text: true, type: true, points: true },
              },
            },
          },
        },
      })

      return completed
    })
  }
}

export const sessionService = new SessionService()