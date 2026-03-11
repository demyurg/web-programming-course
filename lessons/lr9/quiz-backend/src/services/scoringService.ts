export class ScoringService {
  /**
   * Multiple-select scoring
   * +1 за каждый правильный выбранный (уникальный)
   * -0.5 за каждый неправильный выбранный (уникальный)
   * минимум 0
   */
  scoreMultipleSelect(
    correctAnswers: string[],
    studentAnswers: string[]
  ): number {
    // Убираем дубликаты из ответов студента
    const uniqueStudentAnswers = [...new Set(studentAnswers)]
    const correctSet = new Set(correctAnswers)
    
    let score = 0
    const processedAnswers = new Set() // Для отслеживания обработанных ответов

    for (const answer of uniqueStudentAnswers) {
      if (correctSet.has(answer)) {
        score += 1
      } else {
        score -= 0.5
      }
      processedAnswers.add(answer)
    }

    return Math.max(0, score)
  }

  // Альтернативный метод с нормализацией по количеству правильных ответов
  scoreMultipleSelectNormalized(
    correctAnswers: string[],
    studentAnswers: string[],
    maxPoints: number = 1
  ): number {
    const uniqueStudentAnswers = [...new Set(studentAnswers)]
    const correctSet = new Set(correctAnswers)
    
    let correct = 0
    let incorrect = 0

    for (const answer of uniqueStudentAnswers) {
      if (correctSet.has(answer)) {
        correct++
      } else {
        incorrect++
      }
    }

    const rawScore = correct - (incorrect * 0.5)
    const maxPossibleScore = correctAnswers.length
    const normalizedScore = (rawScore / maxPossibleScore) * maxPoints
    
    return Math.max(0, Math.min(maxPoints, normalizedScore))
  }

  scoreEssay(grades: number[], rubric: number[]): number {
    if (grades.length !== rubric.length) {
      throw new Error('Grades and rubric length mismatch')
    }

    let total = 0

    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i]
      const max = rubric[i]

      if (grade < 0 || grade > max) {
        throw new Error(`Invalid grade ${grade} for max ${max}`)
      }

      total += grade
    }

    return total
  }
}

export const scoringService = new ScoringService()