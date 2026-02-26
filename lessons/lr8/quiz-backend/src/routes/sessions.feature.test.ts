import { sign } from "hono/jwt";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db/client.js";
import { app } from "../app.js";
import { resetTestDb } from "../../tests/setup/test-db.js";

describe("sessions routes (feature)", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it("creates session, submits answer and completes session", async () => {
    const user = await prisma.user.create({
      data: {
        githubId: "gh-user-1",
        email: "student1@example.com",
        name: "Student One",
        role: "student",
      },
    });

    const category = await prisma.category.create({
      data: {
        name: "Math",
        slug: "math",
      },
    });

    const question = await prisma.question.create({
      data: {
        text: "Select correct options",
        type: "multiple-select",
        categoryId: category.id,
        correctAnswer: ["A", "C"],
        points: 1,
      },
    });

    const token = await sign({ userId: user.id }, "test-secret");

    const createSessionRes = await app.request("/api/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(createSessionRes.status).toBe(201);
    const created = await createSessionRes.json();
    expect(created.questionCount).toBe(1);
    expect(created.session.userId).toBe(user.id);

    const submitAnswerRes = await app.request(
      `/api/sessions/${created.session.id}/answers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: question.id,
          userAnswer: ["A", "B"],
        }),
      },
    );

    expect(submitAnswerRes.status).toBe(201);
    const submitAnswerJson = await submitAnswerRes.json();
    expect(submitAnswerJson.answer.score).toBe(0.5);
    expect(submitAnswerJson.answer.isCorrect).toBe(false);

    const submitSessionRes = await app.request(
      `/api/sessions/${created.session.id}/submit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    expect(submitSessionRes.status).toBe(200);
    const completedJson = await submitSessionRes.json();
    expect(completedJson.session.status).toBe("completed");
    expect(completedJson.session.score).toBe(0.5);
  });

  it("returns 403 when user accesses another user's session", async () => {
    const owner = await prisma.user.create({
      data: {
        githubId: "gh-owner",
        email: "owner@example.com",
        name: "Owner",
        role: "student",
      },
    });

    const stranger = await prisma.user.create({
      data: {
        githubId: "gh-stranger",
        email: "stranger@example.com",
        name: "Stranger",
        role: "student",
      },
    });

    const session = await prisma.session.create({
      data: {
        userId: owner.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const strangerToken = await sign({ userId: stranger.id }, "test-secret");

    const res = await app.request(`/api/sessions/${session.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${strangerToken}`,
      },
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: "Forbidden",
    });
  });

  it("returns 403 for student on admin endpoint", async () => {
    const student = await prisma.user.create({
      data: {
        githubId: "gh-student",
        email: "student@example.com",
        name: "Student",
        role: "student",
      },
    });

    const token = await sign({ userId: student.id }, "test-secret");

    const res = await app.request("/api/admin/questions", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: "Admin access required",
    });
  });

  it("returns 401 for session creation without token", async () => {
    const res = await app.request("/api/sessions", {
      method: "POST",
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: "Unauthorized",
    });
  });

  it("returns 401 for session creation with invalid token", async () => {
    const res = await app.request("/api/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: "Invalid token",
    });
  });

  it("returns 400 for invalid answer payload", async () => {
    const user = await prisma.user.create({
      data: {
        githubId: "gh-invalid-payload",
        email: "invalid-payload@example.com",
        name: "Invalid Payload",
        role: "student",
      },
    });

    const category = await prisma.category.create({
      data: {
        name: "History",
        slug: "history",
      },
    });

    await prisma.question.create({
      data: {
        text: "History question",
        type: "multiple-select",
        categoryId: category.id,
        correctAnswer: ["A"],
      },
    });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const token = await sign({ userId: user.id }, "test-secret");

    const res = await app.request(`/api/sessions/${session.id}/answers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: "not-cuid",
        userAnswer: 123,
      }),
    });

    expect(res.status).toBe(400);
  });
});
