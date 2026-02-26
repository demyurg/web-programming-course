import { afterAll } from "vitest";
import { prisma } from "../../src/db/client.js";

export async function resetTestDb() {
  await prisma.answer.deleteMany();
  await prisma.session.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

afterAll(async () => {
  await prisma.$disconnect();
});
