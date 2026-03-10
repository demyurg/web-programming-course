import { z } from 'zod';

export const GitHubCallbackSchema = z.object({
  code: z.string().trim().min(1, "code is required"),
});

export const SessionIdParamSchema = z.object({
  id: z.string().trim().cuid("invalid session id"),
});

export const AnswerSchema = z.object({
  sessionId: z.string().trim().cuid("invalid sessionId"),
  questionId: z.string().trim().cuid("invalid questionId"),
  userAnswer: z.union([
    z.array(z.string()),
    z.string(),
  ]),
});

export const GradeSchema = z.object({
  criterion: z.string().trim().min(1, "criterion is required"),
  points: z.number().min(0).max(10),
  feedback: z.string().trim().min(1).optional(),
});

export const QuestionSchema = z.object({
  text: z.string().trim().min(1, "text is required"),
  type: z.enum(["single-select", "multiple-select", "essay"]),
  categoryId: z.string().trim().cuid("invalid categoryId"),
  correctAnswer: z.any().optional(),
  points: z.number().int().min(1).max(100).default(1),
});

export const QuestionUpdateSchema = QuestionSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "at least one field is required",
);

export const GradeAnswerParamSchema = z.object({
  id: z.string().trim().cuid("invalid answer id"),
});

export const QuestionParamSchema = z.object({
  id: z.string().trim().cuid("invalid question id"),
});

export const StudentParamSchema = z.object({
  userId: z.string().trim().cuid("invalid user id"),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const BatchQuestionsSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(100),
});
