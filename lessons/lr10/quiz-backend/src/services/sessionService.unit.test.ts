import { describe, it, expect, vi, beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import type { PrismaClient } from "@prisma/client"
import { sessionService } from "./sessionService.js"
import { scoringService } from "./scoringService.js"

vi.mock("../db/prisma.js", () => ({
  prisma: mockDeep<PrismaClient>()
}))

import { prisma } from "../db/prisma.js"
const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

describe("SessionService Unit Tests", () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  it("should throw error if question not found", async () => {
    prismaMock.question.findUnique.mockResolvedValue(null)
    
    // Важно: submitAnswer использует transaction, нужно замокать и его
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock)
    })

    await expect(sessionService.submitAnswer(
      "session123",
      "question123",
      "4"
    )).rejects.toThrow("Question not found")
  })

  it("should calculate score for single-select", async () => {
    const mockQuestion = {
      id: "question123",
      type: "single-select",
      correctAnswer: "4"
    } as any

    prismaMock.question.findUnique.mockResolvedValue(mockQuestion)
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock))
    prismaMock.answer.upsert.mockResolvedValue({} as any)

    await sessionService.submitAnswer("session123", "question123", "4")
    expect(prismaMock.answer.upsert).toHaveBeenCalled()
  })

  it("should calculate score for multiple-select", async () => {
    const mockQuestion = {
      id: "question123",
      type: "multiple-select",
      correctAnswer: ["A", "C"]
    } as any

    prismaMock.question.findUnique.mockResolvedValue(mockQuestion)
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock))
    
    const spy = vi.spyOn(scoringService, "scoreMultipleSelect")
    prismaMock.answer.upsert.mockResolvedValue({} as any)
    
    await sessionService.submitAnswer("session123", "question123", ["A", "B"])
    expect(spy).toHaveBeenCalled()
  })

  it("should throw error if session expired", async () => {
    const mockSession = {
      id: "session123",
      expiresAt: new Date(Date.now() - 1000)
    } as any

    prismaMock.session.findUnique.mockResolvedValue(mockSession)
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock))

    await expect(sessionService.submitSession("session123"))
      .rejects.toThrow("Session expired")
  })

  it("should calculate total score on submit", async () => {
    const mockSession = {
      id: "session123",
      expiresAt: new Date(Date.now() + 10000),
      answers: [
        { score: 1 },
        { score: 0.5 }
      ]
    } as any

    prismaMock.session.findUnique.mockResolvedValue(mockSession)
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock))
    prismaMock.session.update.mockResolvedValue({} as any)

    await sessionService.submitSession("session123")
    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: "session123" },
      data: {
        status: "completed",
        score: 1.5,
        completedAt: expect.any(Date)
      }
    })
  })
})