import type { Answer, Task } from "./domain";

export type Attempt = {
  id: string;
  setId: string;
  status: "in-progress" | "submitted";
  answers: Answer[];
};

export type ResultItem = {
  taskId: string;
  status: "correct" | "incorrect" | "unanswered" | "pending-review";
  score: number | null;
  maxScore: number;
  feedback: string;
};

export type Result = {
  attemptId: string;
  status: "graded" | "pending-review";
  score: number | null;
  maxScore: number;
  items: ResultItem[];
};

export function isFilled(task: Task, answer: Answer | undefined): boolean {
  if (!answer || answer.taskId !== task.id || answer.kind !== task.kind) return false;
  if (answer.kind === "short-text") return answer.text.trim().length > 0;
  return task.kind === "single-choice" && task.options.some(({ id }) => id === answer.optionId);
}

export function projectAttempt(tasks: Task[], attempt: Attempt, edits: ReadonlyMap<string, Answer>) {
  const confirmed = new Map(attempt.answers.map((answer) => [answer.taskId, answer]));
  const answers = new Map([...confirmed, ...edits]);
  const filledIds = new Set<string>();
  const missingNumbers: number[] = [];
  tasks.forEach((task, index) => {
    if (isFilled(task, answers.get(task.id))) filledIds.add(task.id);
    else missingNumbers.push(index + 1);
  });
  return { answers, confirmed, filledIds, missingNumbers };
}

export function updateInput(attempt: Attempt, edits: ReadonlyMap<string, Answer>, answer: Answer) {
  if (attempt.status === "submitted") return edits;
  const next = new Map(edits);
  next.set(answer.taskId, answer);
  return next;
}
