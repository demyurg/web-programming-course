import type { Answer } from "./domain";

export type State = {
  version: 1;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: "in-progress" | "submitted";
};

export type Action =
  | { type: "answerChanged"; answer: Answer }
  | { type: "moved"; taskId: string }
  | { type: "restored"; state: State }
  | { type: "reset"; setId: string; initialTaskId: string }
  | { type: "submitted" };

export function attemptReducer(state: State, action: Action): State {
  if (state.status === "submitted" && action.type === "answerChanged") {
    return state;
  }

  switch (action.type) {
    case "answerChanged": {
      const filtered = state.answers.filter((a) => a.taskId !== action.answer.taskId);
      return { ...state, answers: [...filtered, action.answer] };
    }
    case "moved": {
      return { ...state, taskId: action.taskId };
    }
    case "restored": {
      return action.state;
    }
    case "reset": {
      return {
        version: 1,
        setId: action.setId,
        taskId: action.initialTaskId,
        answers: [],
        status: "in-progress",
      };
    }
    case "submitted": {
      return { ...state, status: "submitted" };
    }
    default:
      return state;
  }
}