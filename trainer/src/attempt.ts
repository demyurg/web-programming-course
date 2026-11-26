import type { Answer } from "./domain";

export type AttemptStatus = "in-progress" | "submitted";

export type Attempt = {
  answers: Answer[];
  currentIndex: number;
  status: AttemptStatus;
};

export const emptyAttempt: Attempt = {
  answers: [],
  currentIndex: 0,
  status: "in-progress",
};

export type AttemptAction =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerCleared"; taskId: string }
  | { type: "moved"; index: number }
  | { type: "submitted" }
  | { type: "restarted" };

function replaceByTaskId(answers: Answer[], next: Answer): Answer[] {
  return [
    ...answers.filter((item) => item.taskId !== next.taskId),
    next,
  ];
}

export function changeAnswer(attempt: Attempt, next: Answer): Attempt {
  if (attempt.status === "submitted") {
    return attempt;
  }

  return {
    ...attempt,
    answers: replaceByTaskId(attempt.answers, next),
  };
}

export function removeAnswer(attempt: Attempt, taskId: string): Attempt {
  if (attempt.status === "submitted") {
    return attempt;
  }

  return {
    ...attempt,
    answers: attempt.answers.filter((item) => item.taskId !== taskId),
  };
}

export function finishAttempt(attempt: Attempt): Attempt {
  if (attempt.status === "submitted") {
    return attempt;
  }

  return { ...attempt, status: "submitted" };
}

export function attemptReducer(state: Attempt, action: AttemptAction): Attempt {
  switch (action.type) {
    case "answerChanged":
      return changeAnswer(state, action.answer);
    case "answerCleared":
      return removeAnswer(state, action.taskId);
    case "moved":
      return { ...state, currentIndex: action.index };
    case "submitted":
      return finishAttempt(state);
    case "restarted":
      return emptyAttempt;
    default:
      return state;
  }
}
