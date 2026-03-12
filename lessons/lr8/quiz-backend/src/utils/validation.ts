import { z } from 'zod'

export const githubCallbackSchema = z.object({
  code: z.string().min(1, 'code is required'),
})

export const CreateSessionSchema = z.object({
  categoryId: z.string().optional(),
})

export const AnswerSchema = z.object({
  sessionId: z.string().optional(),
  questionId: z.string().min(1, 'questionId is required'),
  userAnswer: z.any(),
})

export const SubmitSessionSchema = z.object({
  sessionId: z.string().optional(),
})

export const GradeSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().max(2000).optional(),
})

export const QuestionSchema = z.object({
  text: z.string().min(3),
  type: z.enum(['single-select', 'multiple-select', 'essay']),
  categoryId: z.string().min(1),
  correctAnswer: z.any().optional(),
  points: z.number().int().min(1).max(100).default(1),
})

export const BatchQuestionsSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(100),
})