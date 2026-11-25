import type { Answer } from "./domain.js";

export type AttemptStatus = "in-progress" | "submitted";

export type AttemptState = {
  answers: Answer[];
  currentIndex: number;
  status: AttemptStatus;
};

export type AttemptAction =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerRemoved"; taskId: string }
  | { type: "moved"; index: number }
  | { type: "submitted" }
  | { type: "reset" };

export function createInitialAttempt(): AttemptState {
  return { answers: [], currentIndex: 0, status: "in-progress" };
}

function replaceAnswer(current: readonly Answer[], next: Answer): Answer[] {
  return [...current.filter((a) => a.taskId !== next.taskId), next];
}

export function attemptReducer(
  state: AttemptState,
  action: AttemptAction,
): AttemptState {
  if (state.status === "submitted" && action.type !== "reset") return state;
  switch (action.type) {
    case "answerChanged":
      return { ...state, answers: replaceAnswer(state.answers, action.answer) };
    case "answerRemoved":
      return {
        ...state,
        answers: state.answers.filter((a) => a.taskId !== action.taskId),
      };
    case "moved":
      return { ...state, currentIndex: action.index };
    case "submitted":
      return { ...state, status: "submitted" };
    case "reset":
      return createInitialAttempt();
    default:
      return state;
  }
}
