import { z } from "zod";

export const githubCallbackSchema = z.object({
  code: z.string().min(1, "code is required"),
});

const jsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const SessionParamSchema = z.object({
  id: z.string().min(1, "session id is required"),
});

export const SubmitSessionSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required").optional(),
});

export const AnswerSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  questionId: z.string().min(1, "questionId is required"),
  userAnswer: z.union([jsonPrimitiveSchema, z.array(z.string())]),
});

export const GradeSchema = z.object({
  score: z.number().min(0, "score must be >= 0"),
  feedback: z.string().min(1).optional(),
});

export const AdminAnswerParamSchema = z.object({
  id: z.string().min(1, "answer id is required"),
});

export const QuestionSchema = z.object({
  text: z.string().min(1, "text is required"),
  type: z.enum(["single-select", "multiple-select", "essay"]),
  categoryId: z.string().min(1, "categoryId is required"),
  correctAnswer: z.any().optional(),
  points: z.number().int().min(1).default(1),
});

export const AdminQuestionParamSchema = z.object({
  id: z.string().min(1, "question id is required"),
});

export const UpdateQuestionSchema = QuestionSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  {
    message: "at least one field must be provided",
  },
);

export const AdminStudentParamSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const QuestionBatchSchema = z.object({
  questions: z.array(QuestionSchema).min(1, "questions must contain at least one item"),
  skipDuplicates: z.boolean().optional().default(true),
});

export type GitHubCallbackInput = z.infer<typeof githubCallbackSchema>;
export type AnswerInput = z.infer<typeof AnswerSchema>;
export type GradeInput = z.infer<typeof GradeSchema>;
export type QuestionInput = z.infer<typeof QuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;
