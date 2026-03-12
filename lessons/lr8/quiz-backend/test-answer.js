// test-answer.js
import { PrismaClient } from '@prisma/client'
import { sessionService } from './src/services/sessionService.js'

const prisma = new PrismaClient()

async function test() {
  try {
    const answer = await sessionService.submitAnswer({
      sessionId: 'cmmnhnriq0001tmbho8yt7l36',
      questionId: 'cmmnhnkv10001o72hp7zp0163',
      userAnswer: ['JavaScript', 'TypeScript']
    })
    console.log('Ответ отправлен:', answer)
  } catch (error) {
    console.error('Ошибка:', error.message)
  }
}

test()