import type { Answer, Task } from "./domain";
import { isAnswerFilled } from "./domain";

export type AttemptStatus = "in-progress" | "submitted";

export type AttemptState = {
  status: AttemptStatus;
  answers: Answer[];
};

export type AttemptAction =
  | { type: "CHANGE_ANSWER"; answer: Answer }
  | { type: "CLEAR_ANSWER"; taskId: string }
  | { type: "SUBMIT" }
  | { type: "RESTART" };

export function attemptReducer(state: AttemptState, action: AttemptAction): AttemptState {
  if (state.status === "submitted" && action.type !== "RESTART") {
    return state;
  }

  switch (action.type) {
    case "CHANGE_ANSWER": {
      const exists = state.answers.some((a) => a.taskId === action.answer.taskId);
      return {
        ...state,
        answers: exists
          ? state.answers.map((a) => (a.taskId === action.answer.taskId ? action.answer : a))
          : [...state.answers, action.answer],
      };
    }
    case "CLEAR_ANSWER": {
      return {
        ...state,
        answers: state.answers.filter((a) => a.taskId !== action.taskId),
      };
    }
    case "SUBMIT": {
      return { ...state, status: "submitted" };
    }
    case "RESTART": {
      return { status: "in-progress", answers: [] };
    }
    default:
      return state;
  }
}

export function getUnansweredTasks(tasks: Task[], answers: Answer[]) {
  return tasks.filter((task) => {
    const answer = answers.find((a) => a.taskId === task.id);
    return !answer || !isAnswerFilled(answer, task);
  });
}