import type { Answer, Draft, Task } from "./domain.js";

export type AttemptStatus = "in-progress" | "submitted";

export type State = {
  answers: Answer[];
  currentIndex: number;
  status: AttemptStatus;
  storageError: string | null;
  draftError: string | null;
};

export type Action =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerCleared"; taskId: string }
  | { type: "moved"; index: number }
  | { type: "restored"; draft: Draft; tasks: readonly Task[] }
  | { type: "reset" }
  | { type: "submitted" }
  | { type: "storageFailed"; message: string }
  | { type: "draftCorrupted" };

function replaceAnswer(current: readonly Answer[], next: Answer): Answer[] {
  return [...current.filter((item) => item.taskId !== next.taskId), next];
}

function removeAnswer(current: readonly Answer[], taskId: string): Answer[] {
  return current.filter((item) => item.taskId !== taskId);
}

export function createInitialState(tasks: readonly Task[]): State {
  return {
    answers: [],
    currentIndex: 0,
    status: "in-progress",
    storageError: null,
    draftError: null,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "answerChanged": {
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: replaceAnswer(state.answers, action.answer),
      };
    }
    case "answerCleared": {
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: removeAnswer(state.answers, action.taskId),
      };
    }
    case "moved": {
      if (state.status === "submitted") return state;
      return { ...state, currentIndex: action.index };
    }
    case "restored": {
      const restoredIndex = action.tasks.findIndex(
        (task) => task.id === action.draft.taskId,
      );
      return {
        ...state,
        answers: action.draft.answers,
        currentIndex: restoredIndex >= 0 ? restoredIndex : 0,
        status: action.draft.status,
        draftError: null,
      };
    }
    case "reset":
      return {
        answers: [],
        currentIndex: 0,
        status: "in-progress",
        storageError: state.storageError,
        draftError: null,
      };
    case "submitted":
      return { ...state, status: "submitted" };
    case "storageFailed":
      return { ...state, storageError: action.message };
    case "draftCorrupted":
      return { ...state, draftError: "Черновик повреждён или несовместим" };
    default:
      return state;
  }
}
