import { Hono } from "hono";
import { admin } from "./routes/admin.js";
import { auth } from "./routes/auth.js";
import { sessions } from "./routes/sessions.js";

export function createApp() {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.route("/api/auth", auth);
  app.route("/api/sessions", sessions);
  app.route("/api/admin", admin);

  return app;
}

export const app = createApp();
