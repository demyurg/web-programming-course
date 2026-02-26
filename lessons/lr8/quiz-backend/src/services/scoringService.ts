export type EssayGrade = {
  criterion: string;
  points: number;
};

export type EssayRubricCriterion = {
  criterion: string;
  maxPoints: number;
};

export class ScoringService {
  scoreMultipleSelect(correctAnswers: string[], studentAnswers: string[]): number {
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

  scoreEssay(grades: EssayGrade[], rubric: EssayRubricCriterion[]): number {
    const rubricMap = new Map<string, number>();
    for (const item of rubric) {
      rubricMap.set(item.criterion, item.maxPoints);
    }

    const byCriterion = new Map<string, number>();
    for (const grade of grades) {
      if (!rubricMap.has(grade.criterion)) {
        continue;
      }

      const safePoints = Math.max(0, grade.points);
      const current = byCriterion.get(grade.criterion) ?? 0;
      byCriterion.set(grade.criterion, current + safePoints);
    }

    let total = 0;
    for (const [criterion, points] of byCriterion) {
      const maxPoints = rubricMap.get(criterion) ?? 0;
      total += Math.min(points, maxPoints);
    }

    return total;
  }
}

export const scoringService = new ScoringService();
