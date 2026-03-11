import { prisma } from '../db/prisma.js'
import { scoringService } from './scoringService.js'

class SessionService {
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: any
  ) {
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.findUnique({
        where: { id: questionId },
      })

      if (!question) throw new Error('Question not found')

      let score: number | null = null

      if (question.type === 'multiple-select') {
        score = scoringService.scoreMultipleSelect(
          question.correctAnswer as string[],
          userAnswer as string[]
        )
      }

      if (question.type === 'single-select') {
        score = userAnswer === question.correctAnswer ? 1 : 0
      }

      const answer = await tx.answer.upsert({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId,
          },
        },
        update: {
          userAnswer,
          score,
        },
        create: {
          sessionId,
          questionId,
          userAnswer,
          score,
        },
      })

      return answer
    })
  }

  async submitSession(sessionId: string) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true },
      })

      if (!session) throw new Error('Session not found')
      if (session.expiresAt < new Date())
        throw new Error('Session expired')

      const totalScore = session.answers.reduce(
        (sum, a) => sum + (a.score ?? 0),
        0
      )

      return tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          score: totalScore,
          completedAt: new Date(),
        },
      })
    })
  }
}

export const sessionService = new SessionService()