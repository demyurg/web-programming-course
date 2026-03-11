import { describe, it, expect, beforeEach } from "vitest"
import { app } from "../../tests/setup/test-app.js"
import { resetTestDb } from "../../tests/setup/test-db.js"
import { prisma } from "../db/prisma.js"

describe("Admin security", () => {
  let studentToken: string

  beforeEach(async () => {
    await resetTestDb()

    // Получаем токен для студента
    const authRes = await app.request("/api/auth/github/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_ok" })
    })
    const authData = await authRes.json()
    studentToken = authData.token
  })

  it("student cannot access admin endpoint", async () => {
    const res = await app.request("/api/admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${studentToken}`
      }
    })

    // Должно быть 403, но если у пользователя нет роли admin, 
    // middleware admin.ts вернет 403
    expect(res.status).toBe(403)
  })
})