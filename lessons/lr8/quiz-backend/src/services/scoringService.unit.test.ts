import { describe, expect, it } from "vitest";
import { ScoringService } from "./scoringService.js";

describe("ScoringService", () => {
  const service = new ScoringService();

  describe("scoreMultipleSelect", () => {
    it("counts only correct answers", () => {
      const score = service.scoreMultipleSelect(["A", "C", "D"], ["A", "C"]);
      expect(score).toBe(2);
    });

    it("applies penalty for wrong answers", () => {
      const score = service.scoreMultipleSelect(["A", "C", "D"], ["A", "B", "C"]);
      expect(score).toBe(1.5);
    });

    it("never returns below zero", () => {
      const score = service.scoreMultipleSelect(["A", "C"], ["B", "D", "E"]);
      expect(score).toBe(0);
    });

    it("returns zero for empty student answers", () => {
      const score = service.scoreMultipleSelect(["A", "B"], []);
      expect(score).toBe(0);
    });

    it("keeps duplicates as separate selections", () => {
      const score = service.scoreMultipleSelect(["A"], ["A", "A", "B"]);
      expect(score).toBe(1.5);
    });
  });

  describe("scoreEssay", () => {
    it("sums points by rubric criteria", () => {
      const score = service.scoreEssay(
        [
          { criterion: "clarity", points: 2 },
          { criterion: "arguments", points: 3 },
        ],
        [
          { criterion: "clarity", maxPoints: 2 },
          { criterion: "arguments", maxPoints: 3 },
        ],
      );

      expect(score).toBe(5);
    });

    it("caps points to rubric max points", () => {
      const score = service.scoreEssay(
        [
          { criterion: "clarity", points: 3 },
          { criterion: "arguments", points: 10 },
        ],
        [
          { criterion: "clarity", maxPoints: 2 },
          { criterion: "arguments", maxPoints: 3 },
        ],
      );

      expect(score).toBe(5);
    });

    it("ignores grades not found in rubric", () => {
      const score = service.scoreEssay(
        [
          { criterion: "clarity", points: 2 },
          { criterion: "style", points: 4 },
        ],
        [{ criterion: "clarity", maxPoints: 3 }],
      );

      expect(score).toBe(2);
    });
  });
});
