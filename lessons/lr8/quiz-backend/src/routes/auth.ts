import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { prisma } from "../db/client.js";
import { GitHubServiceError, getGitHubUserByCode } from "../services/github.js";
import { GitHubCallbackSchema } from "../utils/validation.js";

export const auth = new Hono();

type JwtPayload = {
  userId: string;
  email?: string;
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

async function verifyToken(
  authorization: string | undefined,
): Promise<JwtPayload> {
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
  const userId =
    typeof payload.userId === "string" ? payload.userId : undefined;

  if (!userId) {
    throw new AuthError("Invalid token", 401);
  }

  return {
    userId,
    email: typeof payload.email === "string" ? payload.email : undefined,
  };
}

auth.post("/github/callback", async (c) => {
  try {
    const body = await c.req.json();
    const { code } = GitHubCallbackSchema.parse(body);

    const githubUser = await getGitHubUserByCode(code);
    const githubId = String(githubUser.id);
    const email = githubUser.email ?? `${githubId}@users.noreply.github.com`;
    const name = githubUser.name ?? `GitHub User ${githubId}`;

    const user = await prisma.user.upsert({
      where: { githubId },
      update: { email, name },
      create: { githubId, email, name },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return c.json({ error: "JWT_SECRET is not configured" }, 500);
    }

    const token = await sign(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      jwtSecret,
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
      },
    });
  } catch (error) {
    if (error instanceof GitHubServiceError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});

auth.get("/me", async (c) => {
  try {
    const authorization = c.req.header("Authorization");
    const { userId } = await verifyToken(authorization);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        githubId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    if (error instanceof Error && error.message === "JWT_SECRET is not configured") {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});
