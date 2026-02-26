import type { Context } from "hono";
import { verify } from "hono/jwt";

export type AuthPayload = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

export class AuthError extends Error {
  constructor(message: "Unauthorized" | "Invalid token") {
    super(message);
    this.name = "AuthError";
  }
}

export async function verifyAuthToken(authHeader: string | undefined): Promise<AuthPayload> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("Unauthorized");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || !token) {
    throw new AuthError("Unauthorized");
  }

  let payload: unknown;
  try {
    payload = await verify(token, jwtSecret, "HS256");
  } catch {
    throw new AuthError("Invalid token");
  }

  const data = payload as Record<string, unknown>;
  if (
    !payload ||
    typeof payload !== "object" ||
    typeof data.userId !== "string" ||
    typeof data.email !== "string"
  ) {
    throw new AuthError("Invalid token");
  }

  return data as AuthPayload;
}

export async function requireAuth(c: Context): Promise<AuthPayload> {
  return verifyAuthToken(c.req.header("Authorization"));
}
