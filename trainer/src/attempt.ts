import type { Answer, Progress, Task, TrainingSet } from "./domain";
import { calculateProgress, isAnswerFilled } from "./domain";

export type AttemptStatus = "in-progress" | "confirming" | "submitted";

export type AttemptState = {
  set: TrainingSet;
  status: AttemptStatus;
  answers: Record<string, Answer>;
};

export type AttemptAction =
  | { type: "answer"; answer: Answer }
  | { type: "clear"; taskId: string }
  | { type: "request-finish" }
  | { type: "cancel-finish" }
  | { type: "confirm-finish" }
  | { type: "restart" };

export function createAttempt(set: TrainingSet): AttemptState {
  return { set, status: "in-progress", answers: {} };
}

export function getProgress(state: AttemptState): Progress {
  return calculateProgress(state.set, Object.values(state.answers));
}

export function getMissingTasks(state: AttemptState): Task[] {
  return state.set.tasks.filter((task) => {
    const answer = state.answers[task.id];
    return answer === undefined || !isAnswerFilled(answer);
  });
}

export function attemptReducer(
  state: AttemptState,
  action: AttemptAction,
): AttemptState {
  switch (action.type) {
    case "answer": {
      if (state.status === "submitted") return state;
      const task = state.set.tasks.find((item) => item.id === action.answer.taskId);
      if (task === undefined || task.kind !== action.answer.kind) return state;
      return {
        ...state,
        answers: { ...state.answers, [task.id]: action.answer },
      };
    }

    case "clear": {
      if (state.status === "submitted") return state;
      if (state.answers[action.taskId] === undefined) return state;
      const answers = { ...state.answers };
      delete answers[action.taskId];
      return { ...state, answers };
    }

    case "request-finish": {
      if (state.status === "submitted") return state;
      const hasMissing = getMissingTasks(state).length > 0;
      return { ...state, status: hasMissing ? "confirming" : "submitted" };
    }

    case "cancel-finish": {
      if (state.status !== "confirming") return state;
      return { ...state, status: "in-progress" };
    }

    case "confirm-finish": {
      if (state.status === "submitted") return state;
      return { ...state, status: "submitted" };
    }

    case "restart":
      return createAttempt(state.set);
  }
}
