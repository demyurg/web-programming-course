import type { Context } from "hono";
import { prisma } from "../db/client.js";
import { AuthError, requireAuth } from "./auth.js";

export async function requireAdmin(c: Context) {
  const auth = await requireAuth(c);

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AuthError("Unauthorized");
  }
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return auth;
}
