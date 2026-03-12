export type EssayRubric = {
  maxByCriterion: number[]
}

export class ScoringService {
  scoreMultipleSelect(correctAnswers: string[], studentAnswers: string[]): number {
    const correctSet = new Set(correctAnswers)
    const studentSet = new Set(studentAnswers)

    let score = 0

    for (const answer of studentSet) {
      if (correctSet.has(answer)) {
        score += 1
      } else {
        score -= 0.5
      }
    }

    return Math.max(0, Number(score.toFixed(2)))
  }

  scoreEssay(grades: number[], rubric: EssayRubric): number {
    if (grades.length !== rubric.maxByCriterion.length) {
      throw new Error('Grades count must match rubric criteria count')
    }

    let total = 0
    for (let i = 0; i < grades.length; i++) {
      const max = rubric.maxByCriterion[i]
      const raw = grades[i]
      const normalized = Math.max(0, Math.min(raw, max))
      total += normalized
    }

    return Number(total.toFixed(2))
  }
}

export const scoringService = new ScoringService()