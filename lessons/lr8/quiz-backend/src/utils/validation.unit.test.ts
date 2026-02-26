import { describe, expect, it } from "vitest";
import {
  AnswerSchema,
  BatchQuestionsSchema,
  GitHubCallbackSchema,
  PaginationQuerySchema,
  QuestionSchema,
  QuestionUpdateSchema,
  SessionIdParamSchema,
} from "./validation.js";

const validCuid = "ck12345678901234567890123";

describe("validation schemas", () => {
  it("accepts valid github callback payload", () => {
    const result = GitHubCallbackSchema.safeParse({ code: "gh_code" });
    expect(result.success).toBe(true);
  });

  it("rejects empty github callback code", () => {
    const result = GitHubCallbackSchema.safeParse({ code: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts valid session id param", () => {
    const result = SessionIdParamSchema.safeParse({ id: validCuid });
    expect(result.success).toBe(true);
  });

  it("rejects invalid session id param", () => {
    const result = SessionIdParamSchema.safeParse({ id: "not-cuid" });
    expect(result.success).toBe(false);
  });

  it("accepts answer payload with string[] userAnswer", () => {
    const result = AnswerSchema.safeParse({
      sessionId: validCuid,
      questionId: validCuid,
      userAnswer: ["A", "B"],
    });

    expect(result.success).toBe(true);
  });

  it("accepts answer payload with string userAnswer", () => {
    const result = AnswerSchema.safeParse({
      sessionId: validCuid,
      questionId: validCuid,
      userAnswer: "essay answer",
    });

    expect(result.success).toBe(true);
  });

  it("rejects answer payload with unsupported userAnswer type", () => {
    const result = AnswerSchema.safeParse({
      sessionId: validCuid,
      questionId: validCuid,
      userAnswer: 42,
    });

    expect(result.success).toBe(false);
  });

  it("applies default points in question schema", () => {
    const result = QuestionSchema.safeParse({
      text: "Question?",
      type: "essay",
      categoryId: validCuid,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.points).toBe(1);
    }
  });

  it("rejects question with unsupported type", () => {
    const result = QuestionSchema.safeParse({
      text: "Question?",
      type: "boolean",
      categoryId: validCuid,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid update payload in question update schema", () => {
    const result = QuestionUpdateSchema.safeParse({ text: "   " });
    expect(result.success).toBe(false);
  });

  it("coerces pagination query and applies defaults", () => {
    const result = PaginationQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects pagination query with limit above 100", () => {
    const result = PaginationQuerySchema.safeParse({ page: 1, limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects empty questions array for batch schema", () => {
    const result = BatchQuestionsSchema.safeParse({ questions: [] });
    expect(result.success).toBe(false);
  });
});
