import type { Answer, Task, Result } from "./domain";

export type State = {
  answers: Record<string, Answer>;
  currentIndex: number;
  status: "in-progress" | "submitted";
  view: "task" | "overview" | "result";
  attemptId: string | null;
  result: Result | null;
  loading: boolean;
  error: string | null;
};

export type Action =
  | { type: "init"; attemptId: string; answers: Record<string, Answer>; status: "in-progress" | "submitted" }
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerDeleted"; taskId: string }
  | { type: "moved"; index: number }
  | { type: "viewChanged"; view: "task" | "overview" | "result" }
  | { type: "submitted"; result: Result }
  | { type: "setLoading"; loading: boolean }
  | { type: "setError"; error: string | null }
  | { type: "reset" };

export const initialState: State = {
  answers: {},
  currentIndex: 0,
  status: "in-progress",
  view: "task",
  attemptId: null,
  result: null,
  loading: true,
  error: null,
};

export function attemptReducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return {
        ...state,
        attemptId: action.attemptId,
        answers: action.answers,
        status: action.status,
        view: action.status === "submitted" ? "result" : "task",
        loading: false,
        error: null,
      };
    case "answerChanged":
      if (state.status === "submitted") return state;
      return { ...state, answers: { ...state.answers, [action.answer.taskId]: action.answer }, error: null };
    case "answerDeleted": {
      if (state.status === "submitted") return state;
      const newAnswers = { ...state.answers };
      delete newAnswers[action.taskId];
      return { ...state, answers: newAnswers, error: null };
    }
    case "moved":
      return { ...state, currentIndex: action.index };
    case "viewChanged":
      return { ...state, view: action.view };
    case "submitted":
      return { ...state, status: "submitted", view: "result", result: action.result, loading: false };
    case "setLoading":
      return { ...state, loading: action.loading };
    case "setError":
      return { ...state, error: action.error, loading: false };
    case "reset":
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

export function isAnswered(task: Task, ans: Answer | undefined): boolean {
  if (!ans) return false;
  if (task.kind === "short-text" && ans.kind === "short-text") {
    return ans.text.trim().length > 0;
  }
  return true;
}