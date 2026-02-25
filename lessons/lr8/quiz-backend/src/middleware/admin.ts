import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import { prisma } from "../db/client.js";

export type AdminVariables = {
  userId: string;
  role: string;
};

export const requireAdmin: MiddlewareHandler<{ Variables: AdminVariables }> = async (
  c,
  next,
) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return c.json({ error: "JWT_SECRET is not configured" }, 500);
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let payload: Awaited<ReturnType<typeof verify>>;
  try {
    payload = await verify(token, jwtSecret, "HS256");
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }

  const userId = typeof payload.userId === "string" ? payload.userId : undefined;
  if (!userId) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return c.json({ error: "Invalid token" }, 401);
  }

  c.set("userId", userId);
  c.set("role", user.role);

  if (c.get("role") !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }

  await next();
};
