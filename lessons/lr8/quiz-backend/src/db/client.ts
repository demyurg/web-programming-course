import { PrismaClient } from "@prisma/client";

const slowQueryMs = Number(process.env.SLOW_QUERY_MS ?? 100);

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "warn" },
    { emit: "stdout", level: "error" },
  ],
});

prisma.$on("query", (event) => {
  if (event.duration >= slowQueryMs) {
    console.warn(`[prisma][slow-query] ${event.duration}ms ${event.query}`);
  }
});
