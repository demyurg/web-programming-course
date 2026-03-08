import type { Context } from "hono";
import { verify } from "hono/jwt";

// Middleware для Hono
export async function requireAuth(c: Context, next: () => Promise<void>) {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    // Проверка токена
    const payload = await verify(token, process.env.JWT_SECRET as string, "HS256");

    // Сохраняем userId и email в контексте, чтобы использовать в endpoint
    c.set("userId", payload.sub);
    c.set("email", payload.email);

    // Продолжаем выполнение запроса
    await next();
  } catch (err) {
    return c.json({ message: "Unauthorized" }, 401);
  }
}