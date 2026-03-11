export class ScoringService {
  scoreMultipleSelect(correctAnswers: string[], studentAnswers: string[]): number {
    let score = 0;

    for (const answer of studentAnswers) {
      score += correctAnswers.includes(answer) ? 1 : -0.5;
    }

    return Math.max(0, score);
  }

  scoreEssay(
    grades: { criterion: string; points: number }[],
    rubric: { criterion: string; maxPoints: number }[],
  ): number {
    let total = 0;

    for (const grade of grades) {
      const criterion = rubric.find((item) => item.criterion === grade.criterion);
      if (!criterion) {
        continue;
      }

      total += Math.min(grade.points, criterion.maxPoints);
    }

    return total;
  }
}

export const scoringService = new ScoringService();
