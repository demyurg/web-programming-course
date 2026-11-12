import type { Answer, Task } from "./domain";

export function findAnswer(answers: Answer[], taskId: string) {
  return answers.find((a) => a.taskId === taskId);
}

export function isAnswerFilled(answer: Answer | undefined): boolean {
  if (!answer) {
    return false;
  }

  if (answer.kind === "short-text") {
    return answer.text.trim() !== "";
  }

  return answer.optionId !== "";
}

export function getUnansweredTasks(tasks: Task[], answers: Answer[]): Task[] {
  return tasks.filter((task) => !isAnswerFilled(findAnswer(answers, task.id)));
}

export type Attempt = {
  answers: Answer[];
  status: "in-progress" | "submitted";
};

export type AttemptAction =
  | { type: "answer"; answer: Answer }
  | { type: "clear"; taskId: string }
  | { type: "submit" }
  | { type: "restart" };

export const emptyAttempt: Attempt = { answers: [], status: "in-progress" };

export function attemptReducer(attempt: Attempt, action: AttemptAction): Attempt {
  if (action.type === "restart") {
    return emptyAttempt;
  }

  if (attempt.status === "submitted") {
    return attempt;
  }

  switch (action.type) {
    case "answer":
      return {
        ...attempt,
        answers: [
          ...attempt.answers.filter((a) => a.taskId !== action.answer.taskId),
          action.answer,
        ],
      };
    case "clear":
      return {
        ...attempt,
        answers: attempt.answers.filter((a) => a.taskId !== action.taskId),
      };
    case "submit":
      return { ...attempt, status: "submitted" };
  }
}