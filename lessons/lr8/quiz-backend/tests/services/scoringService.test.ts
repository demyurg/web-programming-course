import test from "node:test";
import assert from "node:assert/strict";
import { ScoringService } from "../../src/services/scoringService.js";

const service = new ScoringService();

test("scoreMultipleSelect: counts only correct answers", () => {
  const score = service.scoreMultipleSelect(["A", "C", "D"], ["A", "C"]);
  assert.equal(score, 2);
});

test("scoreMultipleSelect: applies penalty for wrong answers", () => {
  const score = service.scoreMultipleSelect(["A", "C", "D"], ["A", "B", "C"]);
  assert.equal(score, 1.5);
});

test("scoreMultipleSelect: never returns below zero", () => {
  const score = service.scoreMultipleSelect(["A", "C"], ["B", "D", "E"]);
  assert.equal(score, 0);
});

test("scoreMultipleSelect: returns zero for empty student answers", () => {
  const score = service.scoreMultipleSelect(["A", "B"], []);
  assert.equal(score, 0);
});

test("scoreMultipleSelect: returns full score when all selections are correct", () => {
  const score = service.scoreMultipleSelect(["A", "B", "C"], ["A", "B", "C"]);
  assert.equal(score, 3);
});

test("scoreEssay: sums points by rubric criteria", () => {
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

  assert.equal(score, 5);
});

test("scoreEssay: caps points to max points from rubric", () => {
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

  assert.equal(score, 5);
});

test("scoreEssay: ignores grades not found in rubric", () => {
  const score = service.scoreEssay(
    [
      { criterion: "clarity", points: 2 },
      { criterion: "style", points: 4 },
    ],
    [{ criterion: "clarity", maxPoints: 3 }],
  );

  assert.equal(score, 2);
});

test("scoreEssay: returns zero for empty grades", () => {
  const score = service.scoreEssay([], [{ criterion: "clarity", maxPoints: 2 }]);
  assert.equal(score, 0);
});

test("scoreEssay: keeps fractional scores", () => {
  const score = service.scoreEssay(
    [
      { criterion: "clarity", points: 1.5 },
      { criterion: "arguments", points: 2.25 },
    ],
    [
      { criterion: "clarity", maxPoints: 2 },
      { criterion: "arguments", maxPoints: 3 },
    ],
  );

  assert.equal(score, 3.75);
});
