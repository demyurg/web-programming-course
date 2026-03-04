import { z } from 'zod'

export const githubCallbackSchema = z.object({
  code: z.string().min(1, 'code is required')
})

export type GitHubCallbackInput = z.infer<typeof githubCallbackSchema>

// Answer (submit answer)
export const AnswerSchema = z.object({
  questionId: z.string().min(1),
  userAnswer: z.union([
    z.array(z.string()),
    z.string()
  ]),
  sessionId: z.string().min(1)
})

// Grade (essay grading)
export const GradeSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional()
})

// Question (create question)
export const QuestionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['multiple-select', 'essay']),
  categoryId: z.string().min(1),
  correctAnswer: z.any().optional(),
  points: z.number().min(1)
})