import { Hono } from "hono";
import { sign } from "hono/jwt";
import { prisma } from "../db/client.js";
import { AuthError, verifyAuthToken } from "../middleware/auth.js";
import { getGitHubUserByCode } from "../services/github.js";
import { githubCallbackSchema } from "../utils/validation.js";

const authRoutes = new Hono();

authRoutes.post("/github/callback", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = githubCallbackSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid request body", details: parsed.error.flatten() }, 400);
  }

  try {
    const githubUser = await getGitHubUserByCode(parsed.data.code);
    const githubId = String(githubUser.id);
    const email = githubUser.email ?? `${githubId}@users.noreply.github.com`;
    const name = githubUser.name ?? null;

    const user = await prisma.user.upsert({
      where: { githubId },
      update: { email, name },
      create: { githubId, email, name },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return c.json({ error: "JWT_SECRET is not configured" }, 500);
    }

    const now = Math.floor(Date.now() / 1000);
    const token = await sign(
      {
        userId: user.id,
        email: user.email,
        iat: now,
        exp: now + 60 * 60 * 24,
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
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === "GitHubServiceError" &&
      "statusCode" in error &&
      (error.statusCode === 400 || error.statusCode === 500)
    ) {
      return c.json({ error: error.message }, error.statusCode);
    }

    console.error("GitHub callback failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

authRoutes.get("/me", async (c) => {
  try {
    const payload = await verifyAuthToken(c.req.header("Authorization"));

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, 401);
    }

    console.error("Get current user failed:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default authRoutes;
