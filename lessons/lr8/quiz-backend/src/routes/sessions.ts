import { Hono } from "hono";
import { verify } from "hono/jwt";
import { z } from "zod";
import { prisma } from "../db/client.js";
import { SessionServiceError, sessionService } from "../services/sessionService.js";
import { AnswerSchema, SessionIdParamSchema } from "../utils/validation.js";

export const sessions = new Hono();

type JwtPayload = {
  userId: string;
};

class AuthError extends Error {
  constructor(
    message: "Unauthorized" | "Invalid token",
    public readonly statusCode: 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function verifyToken(authorization: string | undefined): Promise<JwtPayload> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  if (!authorization?.startsWith("Bearer ")) {
    throw new AuthError("Unauthorized", 401);
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new AuthError("Unauthorized", 401);
  }

  let payload: Awaited<ReturnType<typeof verify>>;
  try {
    payload = await verify(token, jwtSecret, "HS256");
  } catch {
    throw new AuthError("Invalid token", 401);
  }

  const userId = typeof payload.userId === "string" ? payload.userId : undefined;
  if (!userId) {
    throw new AuthError("Invalid token", 401);
  }

  return { userId };
}

sessions.post("/", async (c) => {
  try {
    const authorization = c.req.header("Authorization");
    const { userId } = await verifyToken(authorization);

    const questionCount = await prisma.question.count();

    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        completedAt: true,
        score: true,
      },
    });

    return c.json({
      session,
      questionCount,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.flatten() }, 400);
    }

    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof Error && error.message === "JWT_SECRET is not configured") {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});

sessions.post("/:id/answers", async (c) => {
  try {
    const authorization = c.req.header("Authorization");
    const { userId } = await verifyToken(authorization);

    const { id } = SessionIdParamSchema.parse(c.req.param());

    const session = await prisma.session.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (session.userId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const data = AnswerSchema.parse({
      ...body,
      sessionId: id,
    });

    const answer = await sessionService.submitAnswer(id, data.questionId, data.userAnswer);

    return c.json({ answer }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.flatten() }, 400);
    }

    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof SessionServiceError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof Error && error.message === "JWT_SECRET is not configured") {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});

sessions.get("/:id", async (c) => {
  try {
    const authorization = c.req.header("Authorization");
    const { userId } = await verifyToken(authorization);

    const { id } = SessionIdParamSchema.parse(c.req.param());

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (session.userId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({ session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.flatten() }, 400);
    }

    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof Error && error.message === "JWT_SECRET is not configured") {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});

sessions.post("/:id/submit", async (c) => {
  try {
    const authorization = c.req.header("Authorization");
    const { userId } = await verifyToken(authorization);

    const { id } = SessionIdParamSchema.parse(c.req.param());
    const session = await prisma.session.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (session.userId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const completedSession = await sessionService.submitSession(id);
    return c.json({ session: completedSession });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.flatten() }, 400);
    }

    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof SessionServiceError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof Error && error.message === "JWT_SECRET is not configured") {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});
