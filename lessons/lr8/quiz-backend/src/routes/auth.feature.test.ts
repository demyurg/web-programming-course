import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../app.js";
import { resetTestDb } from "../../tests/setup/test-db.js";

describe("auth routes (feature)", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it("completes github callback auth flow and returns jwt token", async () => {
    const res = await app.request("/api/auth/github/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_ok" }),
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.token).toBeTypeOf("string");
    expect(json.user).toMatchObject({
      email: "testuser@example.com",
      githubId: "123456",
      name: "Test User",
    });
  });

  it("returns current user on /api/auth/me with bearer token", async () => {
    const callbackRes = await app.request("/api/auth/github/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_auth_me" }),
    });

    const callbackJson = await callbackRes.json();
    const token = callbackJson.token as string;

    const meRes = await app.request("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(meRes.status).toBe(200);
    const meJson = await meRes.json();
    expect(meJson.user).toMatchObject({
      email: "testuser@example.com",
      githubId: "123456",
      name: "Test User",
    });
  });

  it("returns 401 for /api/auth/me without token", async () => {
    const res = await app.request("/api/auth/me", {
      method: "GET",
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: "Unauthorized",
    });
  });

  it("returns 401 for /api/auth/me with invalid token", async () => {
    const res = await app.request("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: "Invalid token",
    });
  });
});
