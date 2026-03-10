import test from "node:test";
import assert from "node:assert/strict";
import { ScoringService } from "../../src/services/scoringService.js";

const service = new ScoringService();

test("scoreMultipleSelect: applies penalties and floors negative totals", () => {
  const score = service.scoreMultipleSelect(["A"], ["B", "C", "D", "E"]);
  assert.equal(score, 0);
});

test("scoreMultipleSelect: keeps fractional result with mixed selections", () => {
  const score = service.scoreMultipleSelect(["A", "B", "C", "D"], ["A", "X", "C"]);
  assert.equal(score, 1.5);
});

test("scoreMultipleSelect: supports duplicated selected options as independent picks", () => {
  const score = service.scoreMultipleSelect(["A", "B"], ["A", "A", "Z"]);
  assert.equal(score, 1.5);
});

test("scoreMultipleSelect: returns zero when both arrays are empty", () => {
  const score = service.scoreMultipleSelect([], []);
  assert.equal(score, 0);
});

test("scoreMultipleSelect: returns full points when student matches all correct and only correct", () => {
  const score = service.scoreMultipleSelect(["Q1", "Q2"], ["Q1", "Q2"]);
  assert.equal(score, 2);
});

test("scoreEssay: sums points across multiple criteria", () => {
  const score = service.scoreEssay(
    [
      { criterion: "accuracy", points: 4 },
      { criterion: "structure", points: 2 },
      { criterion: "examples", points: 1 },
    ],
    [
      { criterion: "accuracy", maxPoints: 5 },
      { criterion: "structure", maxPoints: 3 },
      { criterion: "examples", maxPoints: 2 },
    ],
  );

  assert.equal(score, 7);
});

test("scoreEssay: caps accumulated points for duplicated criterion grades", () => {
  const score = service.scoreEssay(
    [
      { criterion: "logic", points: 2.5 },
      { criterion: "logic", points: 2 },
    ],
    [{ criterion: "logic", maxPoints: 3 }],
  );

  assert.equal(score, 3);
});

test("scoreEssay: ignores unknown criteria even when they have high points", () => {
  const score = service.scoreEssay(
    [
      { criterion: "depth", points: 2 },
      { criterion: "bonus", points: 50 },
    ],
    [{ criterion: "depth", maxPoints: 4 }],
  );

  assert.equal(score, 2);
});

test("scoreEssay: treats negative points as zero contribution", () => {
  const score = service.scoreEssay(
    [
      { criterion: "clarity", points: -1 },
      { criterion: "evidence", points: 2 },
    ],
    [
      { criterion: "clarity", maxPoints: 3 },
      { criterion: "evidence", maxPoints: 2 },
    ],
  );

  assert.equal(score, 2);
});

test("scoreEssay: returns zero when rubric is empty", () => {
  const score = service.scoreEssay(
    [{ criterion: "anything", points: 4 }],
    [],
  );

  assert.equal(score, 0);
});
