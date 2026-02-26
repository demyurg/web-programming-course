import { Hono } from "hono";
import { prisma } from "../db/client.js";
import { AuthError, requireAuth } from "../middleware/auth.js";
import { sessionService } from "../services/sessionService.js";
import { AnswerSchema, SessionParamSchema, SubmitSessionSchema } from "../utils/validation.js";

const sessionsRoutes = new Hono();

async function requireSessionOwner(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true },
  });

  if (!session) {
    throw new Error("Session not found");
  }
  if (session.userId !== userId) {
    throw new Error("Forbidden");
  }
}

sessionsRoutes.post("/", async (c) => {
  try {
    const auth = await requireAuth(c);
    const body = await c.req.json().catch(() => ({} as { categoryId?: string }));
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : undefined;

    const where = categoryId ? { categoryId } : undefined;
    const totalQuestions = await prisma.question.count({ where });

    const session = await prisma.session.create({
      data: {
        userId: auth.userId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      select: {
        id: true,
        userId: true,
        status: true,
        score: true,
        startedAt: true,
        expiresAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json(
      {
        session: {
          ...session,
          totalQuestions,
          categoryId: categoryId ?? null,
        },
      },
      201,
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, 401);
    }
    console.error("Create session failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

sessionsRoutes.post("/:id/answers", async (c) => {
  try {
    const auth = await requireAuth(c);
    const paramsParsed = SessionParamSchema.safeParse(c.req.param());
    if (!paramsParsed.success) {
      return c.json({ error: "Invalid params", details: paramsParsed.error.flatten() }, 400);
    }
    const { id } = paramsParsed.data;
    await requireSessionOwner(id, auth.userId);

    const body = await c.req.json().catch(() => null);
    const parsed = AnswerSchema.safeParse({
      ...(typeof body === "object" && body !== null ? body : {}),
      sessionId: id,
    });
    if (!parsed.success) {
      return c.json({ error: "Invalid request body", details: parsed.error.flatten() }, 400);
    }

    const answer = await sessionService.submitAnswer(id, parsed.data.questionId, parsed.data.userAnswer);
    return c.json({ answer }, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, 401);
    }
    if (error instanceof Error) {
      if (error.message === "Session not found") {
        return c.json({ error: error.message }, 404);
      }
      if (error.message === "Forbidden") {
        return c.json({ error: error.message }, 403);
      }
      if (
        error.message === "Session is not active" ||
        error.message === "Session expired" ||
        error.message === "Question not found"
      ) {
        return c.json({ error: error.message }, 400);
      }
    }
    console.error("Submit answer failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

sessionsRoutes.get("/:id", async (c) => {
  try {
    const auth = await requireAuth(c);
    const { id } = c.req.param();
    await requireSessionOwner(id, auth.userId);

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                points: true,
                categoryId: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    return c.json({ session });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, 401);
    }
    if (error instanceof Error) {
      if (error.message === "Session not found") {
        return c.json({ error: error.message }, 404);
      }
      if (error.message === "Forbidden") {
        return c.json({ error: error.message }, 403);
      }
    }
    console.error("Get session failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

sessionsRoutes.post("/:id/submit", async (c) => {
  try {
    const auth = await requireAuth(c);
    const paramsParsed = SessionParamSchema.safeParse(c.req.param());
    if (!paramsParsed.success) {
      return c.json({ error: "Invalid params", details: paramsParsed.error.flatten() }, 400);
    }
    const { id } = paramsParsed.data;

    const body = await c.req.json().catch(() => ({}));
    const bodyParsed = SubmitSessionSchema.safeParse(body);
    if (!bodyParsed.success) {
      return c.json({ error: "Invalid request body", details: bodyParsed.error.flatten() }, 400);
    }
    if (bodyParsed.data.sessionId && bodyParsed.data.sessionId !== id) {
      return c.json(
        { error: "Invalid request body", details: { fieldErrors: { sessionId: ["sessionId must match route id"] } } },
        400,
      );
    }

    await requireSessionOwner(id, auth.userId);

    const session = await sessionService.submitSession(id);
    return c.json({ session });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, 401);
    }
    if (error instanceof Error) {
      if (error.message === "Session not found") {
        return c.json({ error: error.message }, 404);
      }
      if (error.message === "Forbidden") {
        return c.json({ error: error.message }, 403);
      }
      if (error.message === "Session is not active") {
        return c.json({ error: error.message }, 400);
      }
    }
    console.error("Submit session failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default sessionsRoutes;
