import { Hono } from "hono";
import type { Context } from "hono";
import { prisma } from "../db/client.js";
import { requireAdmin } from "../middleware/admin.js";
import { AuthError } from "../middleware/auth.js";
import {
  AdminAnswerParamSchema,
  AdminQuestionParamSchema,
  AdminStudentParamSchema,
  GradeSchema,
  PaginationQuerySchema,
  QuestionSchema,
  QuestionBatchSchema,
  UpdateQuestionSchema,
} from "../utils/validation.js";

const adminRoutes = new Hono();

function handleAdminError(c: Context, error: unknown) {
  if (error instanceof AuthError) {
    return c.json({ error: error.message }, 401);
  }
  if (error instanceof Error && error.message === "Forbidden") {
    return c.json({ error: error.message }, 403);
  }
  if (error instanceof Error && error.message === "Not found") {
    return c.json({ error: "Not found" }, 404);
  }

  return null;
}

adminRoutes.get("/questions", async (c) => {
  try {
    await requireAdmin(c);

    const questions = await prisma.question.findMany({
      select: {
        id: true,
        text: true,
        type: true,
        points: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({ questions });
  } catch (error) {
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Get admin questions failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

adminRoutes.post("/questions", async (c) => {
  try {
    await requireAdmin(c);

    const body = await c.req.json().catch(() => null);
    const parsed = QuestionSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body", details: parsed.error.flatten() }, 400);
    }

    const question = await prisma.question.create({
      data: parsed.data,
    });

    return c.json({ question }, 201);
  } catch (error) {
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Create admin question failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

adminRoutes.post("/questions/batch", async (c) => {
  try {
    await requireAdmin(c);

    const body = await c.req.json().catch(() => null);
    const parsed = QuestionBatchSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body", details: parsed.error.flatten() }, 400);
    }

    const result = await prisma.question.createMany({
      data: parsed.data.questions,
    });

    return c.json({ createdCount: result.count }, 201);
  } catch (error) {
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Batch create questions failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

adminRoutes.put("/questions/:id", async (c) => {
  try {
    await requireAdmin(c);

    const paramsParsed = AdminQuestionParamSchema.safeParse(c.req.param());
    if (!paramsParsed.success) {
      return c.json({ error: "Invalid params", details: paramsParsed.error.flatten() }, 400);
    }
    const { id } = paramsParsed.data;

    const body = await c.req.json().catch(() => null);
    const parsed = UpdateQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body", details: parsed.error.flatten() }, 400);
    }

    const question = await prisma.question.update({
      where: { id },
      data: parsed.data,
    });

    return c.json({ question });
  } catch (error) {
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Update admin question failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

adminRoutes.get("/answers/pending", async (c) => {
  try {
    await requireAdmin(c);
    const queryParsed = PaginationQuerySchema.safeParse(c.req.query());
    if (!queryParsed.success) {
      return c.json({ error: "Invalid query", details: queryParsed.error.flatten() }, 400);
    }
    const { page, limit } = queryParsed.data;
    const skip = (page - 1) * limit;

    const [answers, total] = await Promise.all([
      prisma.answer.findMany({
        where: {
          score: null,
          question: { type: "essay" },
        },
        select: {
          id: true,
          sessionId: true,
          questionId: true,
          userAnswer: true,
          score: true,
          createdAt: true,
          updatedAt: true,
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              points: true,
              categoryId: true,
            },
          },
          session: {
            select: {
              id: true,
              status: true,
              startedAt: true,
              expiresAt: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.answer.count({
        where: {
          score: null,
          question: { type: "essay" },
        },
      }),
    ]);

    return c.json({
      answers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Get pending answers failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

adminRoutes.get("/students", async (c) => {
  try {
    await requireAdmin(c);
    const queryParsed = PaginationQuerySchema.safeParse(c.req.query());
    if (!queryParsed.success) {
      return c.json({ error: "Invalid query", details: queryParsed.error.flatten() }, 400);
    }
    const { page, limit } = queryParsed.data;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: "student" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              sessions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: { role: "student" },
      }),
    ]);

    return c.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Get students failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

adminRoutes.post("/answers/:id/grade", async (c) => {
  try {
    await requireAdmin(c);
    const paramsParsed = AdminAnswerParamSchema.safeParse(c.req.param());
    if (!paramsParsed.success) {
      return c.json({ error: "Invalid params", details: paramsParsed.error.flatten() }, 400);
    }
    const { id } = paramsParsed.data;

    const body = await c.req.json().catch(() => null);
    const parsed = GradeSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body", details: parsed.error.flatten() }, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingAnswer = await tx.answer.findUnique({
        where: { id },
        select: {
          id: true,
          sessionId: true,
          question: { select: { type: true } },
        },
      });
      if (!existingAnswer) {
        throw new Error("Not found");
      }
      if (existingAnswer.question.type !== "essay") {
        throw new Error("Only essay answers can be graded here");
      }

      const answer = await tx.answer.update({
        where: { id },
        data: {
          score: parsed.data.score,
          isCorrect: null,
        },
      });

      const sessionAnswers = await tx.answer.findMany({
        where: { sessionId: answer.sessionId },
        select: { score: true },
      });

      const allGraded = sessionAnswers.every((item) => item.score !== null);
      let session = null;
      if (allGraded) {
        const totalScore = sessionAnswers.reduce((sum, item) => sum + (item.score ?? 0), 0);
        session = await tx.session.update({
          where: { id: answer.sessionId },
          data: {
            score: totalScore,
            status: "completed",
            completedAt: new Date(),
          },
          select: {
            id: true,
            status: true,
            score: true,
            completedAt: true,
          },
        });
      }

      return { answer, session, allGraded };
    });

    return c.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Only essay answers can be graded here") {
      return c.json({ error: error.message }, 400);
    }
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Grade answer failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

adminRoutes.get("/students/:userId/stats", async (c) => {
  try {
    await requireAdmin(c);

    const paramsParsed = AdminStudentParamSchema.safeParse(c.req.param());
    if (!paramsParsed.success) {
      return c.json({ error: "Invalid params", details: paramsParsed.error.flatten() }, 400);
    }
    const { userId } = paramsParsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    if (!user) {
      return c.json({ error: "Not found" }, 404);
    }

    const [sessions, aggregate] = await Promise.all([
      prisma.session.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          score: true,
          startedAt: true,
          completedAt: true,
          expiresAt: true,
          _count: {
            select: {
              answers: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
      }),
      prisma.session.aggregate({
        where: { userId },
        _count: { id: true },
        _avg: { score: true },
      }),
    ]);

    return c.json({
      student: user,
      totalSessions: aggregate._count.id,
      averageScore: aggregate._avg.score ?? 0,
      sessions,
    });
  } catch (error) {
    const handled = handleAdminError(c, error);
    if (handled) return handled;
    console.error("Get student stats failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default adminRoutes;
