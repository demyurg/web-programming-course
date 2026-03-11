import { describe, it, expect } from "vitest"
import { app } from "../app.js"

describe("Sessions feature", () => {

  let sessionId: string

  it("create session without token returns 401", async () => {
    const res = await app.request("/api/sessions", {
      method: "POST"
    })

    expect(res.status).toBe(401)
  })

  it("get session without token returns 401", async () => {
    const res = await app.request("/api/sessions/test")

    expect(res.status).toBe(401)
  })

  it("submit answer without token returns 401", async () => {
    const res = await app.request("/api/sessions/test/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: "q1",
        userAnswer: ["A"]
      })
    })

    expect(res.status).toBe(401)
  })

})