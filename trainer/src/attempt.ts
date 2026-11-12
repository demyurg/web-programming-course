import type { Answer, Task, TrainingSet } from "./domain";
import { isAnswerFilled } from "./domain";

export type AttemptStatus = "in-progress" | "submitted";

export type Attempt = {
  status: AttemptStatus;
  answers: Answer[];
};

export type AttemptAction =
  | { type: "set-answer"; answer: Answer }
  | { type: "clear-answer"; taskId: string }
  | { type: "submit" }
  | { type: "restart" };


export function createAttempt(): Attempt {
  return { status: "in-progress", answers: [] };
}

export function findAnswer(answers: Answer[], taskId: string): Answer | undefined {
  return answers.find((answer) => answer.taskId === taskId);
}

export function isTaskAnswered(answers: Answer[], taskId: string): boolean {
  const answer = findAnswer(answers, taskId);
  return answer !== undefined && isAnswerFilled(answer);
}

export function getUnfilledTasks(set: TrainingSet, answers: Answer[]): Task[] {
  return set.tasks.filter((task) => !isTaskAnswered(answers, task.id));
}

export function setAnswer(attempt: Attempt, answer: Answer): Attempt {
  if (attempt.status === "submitted") return attempt;
  return {
    ...attempt,
    answers: [
      ...attempt.answers.filter((item) => item.taskId !== answer.taskId),
      answer,
    ],
  };
}

export function clearAnswer(attempt: Attempt, taskId: string): Attempt {
  if (attempt.status === "submitted") return attempt;
  return {
    ...attempt,
    answers: attempt.answers.filter((item) => item.taskId !== taskId),
  };
}

export function submitAttempt(attempt: Attempt): Attempt {
  if (attempt.status === "submitted") return attempt;
  return { ...attempt, status: "submitted" };
}

export function attemptReducer(attempt: Attempt, action: AttemptAction): Attempt {
  switch (action.type) {
    case "set-answer":
      return setAnswer(attempt, action.answer);
    case "clear-answer":
      return clearAnswer(attempt, action.taskId);
    case "submit":
      return submitAttempt(attempt);
    case "restart":
      return createAttempt();
  }
}
