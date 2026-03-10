import type { Prisma, Question } from "@prisma/client";
import { prisma } from "../db/client.js";
import { scoringService } from "./scoringService.js";

type QuestionAnswerInput = string | string[] | number | boolean | null;

function asStringArray(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function scoreAutoCheckedAnswer(question: Question, userAnswer: Prisma.JsonValue): {
  score: number | null;
  isCorrect: boolean | null;
} {
  if (question.type === "essay") {
    return { score: null, isCorrect: null };
  }

  if (question.type === "multiple-select") {
    const correctAnswers = asStringArray(question.correctAnswer);
    const studentAnswers = Array.isArray(userAnswer)
      ? userAnswer.filter((item): item is string => typeof item === "string")
      : [];

    const score = scoringService.scoreMultipleSelect(correctAnswers, studentAnswers);
    const isCorrect =
      correctAnswers.length === studentAnswers.length &&
      correctAnswers.every((answer) => studentAnswers.includes(answer));

    return { score, isCorrect };
  }

  if (question.type === "single-select") {
    const expected = typeof question.correctAnswer === "string" ? question.correctAnswer : null;
    const actual = typeof userAnswer === "string" ? userAnswer : null;
    const isCorrect = expected !== null && actual !== null && expected === actual;

    return {
      score: isCorrect ? question.points : 0,
      isCorrect,
    };
  }

  return { score: null, isCorrect: null };
}

export class SessionService {
  async submitAnswer(sessionId: string, questionId: string, userAnswer: QuestionAnswerInput) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error("Session not found");
      }
      if (session.status !== "in_progress") {
        throw new Error("Session is not active");
      }
      if (session.expiresAt < new Date()) {
        await tx.session.update({
          where: { id: session.id },
          data: { status: "expired" },
        });
        throw new Error("Session expired");
      }

      const question = await tx.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      const auto = scoreAutoCheckedAnswer(question, userAnswer as Prisma.JsonValue);

      return tx.answer.upsert({
        where: {
          sessionId_questionId: { sessionId, questionId },
        },
        update: {
          userAnswer: userAnswer as Prisma.InputJsonValue,
          score: auto.score,
          isCorrect: auto.isCorrect,
        },
        create: {
          sessionId,
          questionId,
          userAnswer: userAnswer as Prisma.InputJsonValue,
          score: auto.score,
          isCorrect: auto.isCorrect,
        },
        include: {
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              points: true,
            },
          },
        },
      });
    });
  }

  async submitSession(sessionId: string) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true },
      });

      if (!session) {
        throw new Error("Session not found");
      }
      if (session.status !== "in_progress") {
        throw new Error("Session is not active");
      }
      if (session.expiresAt < new Date()) {
        return tx.session.update({
          where: { id: session.id },
          data: { status: "expired" },
          include: {
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                    text: true,
                    type: true,
                    points: true,
                  },
                },
              },
            },
          },
        });
      }

      const totalScore = session.answers
        .filter((answer) => answer.score !== null)
        .reduce((sum, answer) => sum + (answer.score ?? 0), 0);

      return tx.session.update({
        where: { id: session.id },
        data: {
          status: "completed",
          score: totalScore,
          completedAt: new Date(),
        },
        include: {
          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  text: true,
                  type: true,
                  points: true,
                },
              },
            },
          },
        },
      });
    });
  }
}

export const sessionService = new SessionService();
