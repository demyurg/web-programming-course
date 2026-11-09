import type { Answer } from "./domain";

export type AttemptState = {
  answers: Answer[];
  isSubmitted: boolean;
};

export type AttemptAction =
  | { type: "save"; answer: Answer }
  | { type: "clear"; taskId: string }
  | { type: "submit" }
  | { type: "restart" };

export function attemptReducer(state: AttemptState, action: AttemptAction): AttemptState {
  if (state.isSubmitted && action.type !== "restart") {
    return state;
  }

  switch (action.type) {
    case "save": {
      const filtered = state.answers.filter((a) => a.taskId !== action.answer.taskId);
      return { ...state, answers: [...filtered, action.answer] };
    }
    case "clear": {
      const filtered = state.answers.filter((a) => a.taskId !== action.taskId);
      return { ...state, answers: filtered };
    }
    case "submit": {
      return { ...state, isSubmitted: true };
    }
    case "restart": {
      return { answers: [], isSubmitted: false };
    }
    default:
      return state;
  }
}