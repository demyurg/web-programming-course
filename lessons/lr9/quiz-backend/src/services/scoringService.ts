export class ScoringService {
  /**
   * Multiple-select scoring
   * +1 за каждый правильный выбранный
   * -0.5 за каждый неправильный выбранный
   * минимум 0
   */
  scoreMultipleSelect(
    correctAnswers: string[],
    studentAnswers: string[]
  ): number {
    const correctSet = new Set(correctAnswers);
    let score = 0;

    for (const answer of studentAnswers) {
      if (correctSet.has(answer)) {
        score += 1;
      } else {
        score -= 0.5;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Essay scoring
   * grades — оценки по каждому критерию
   * rubric — максимальные баллы по каждому критерию
   *
   * Пример:
   * grades = [3, 4]
   * rubric = [5, 5]
   */
  scoreEssay(grades: number[], rubric: number[]): number {
    if (grades.length !== rubric.length) {
      throw new Error("Grades and rubric length mismatch");
    }

    let total = 0;

    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i];
      const max = rubric[i];

      if (grade < 0 || grade > max) {
        throw new Error(`Invalid grade ${grade} for max ${max}`);
      }

      total += grade;
    }

    return total;
  }
}

// singleton
export const scoringService = new ScoringService();