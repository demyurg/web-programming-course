import z from 'zod';

export const authCallbackSchema = z.object({
  code: z.string().min(1),
});

// Answer validation
export const AnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.union([
    z.array(z.string()),  // multiple-select
    z.string()             // essay
  ]),
  sessionId: z.string()
});

// Scoring rules validation
export const ScoringRulesSchema = z.object({
  pointsPerCorrect: z.number().min(0).max(10),
  pointsPerIncorrect: z.number().min(-5).max(0),
  minScore: z.number().min(0),
  maxScore: z.number().positive()
});

// Grade validation (for essay)
export const GradeSchema = z.object({
  criterion: z.string(),
  points: z.number().min(0).max(10),
  feedback: z.string().optional()
});