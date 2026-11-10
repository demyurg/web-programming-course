import type { Answer, Task } from "./domain";

export type State = {
  answers: Record<string, Answer>;
  currentIndex: number;
  status: "in-progress" | "submitted";
  view: "task" | "overview"; // Режим: прохождение или обзор
};

export type Action =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerDeleted"; taskId: string }
  | { type: "moved"; index: number }
  | { type: "viewChanged"; view: "task" | "overview" }
  | { type: "submitted" }
  | { type: "reset" };

export const initialState: State = {
  answers: {},
  currentIndex: 0,
  status: "in-progress",
  view: "task",
};

// Главное правило-редьюсер
export function attemptReducer(state: State, action: Action): State {
  // Защита на уровне правил: если сдано, игнорируем любые изменения
  if (state.status === "submitted" && action.type !== "reset") {
    return state;
  }

  switch (action.type) {
    case "answerChanged":
      return {
        ...state,
        answers: { ...state.answers, [action.answer.taskId]: action.answer },
      };

    case "answerDeleted": {
      // Создаем копию без удаляемого ответа
      const newAnswers = { ...state.answers };
      delete newAnswers[action.taskId];
      return { ...state, answers: newAnswers };
    }

    case "moved":
      return { ...state, currentIndex: action.index };

    case "viewChanged":
      return { ...state, view: action.view };

    case "submitted":
      return { ...state, status: "submitted", view: "overview" };

    case "reset":
      return initialState;

    default:
      return state;
  }
}

// Вспомогательная функция проверки (нужна для подсчета пропусков)
export function isAnswered(task: Task, ans: Answer | undefined): boolean {
  if (!ans) return false;
  if (task.kind === "short-text" && ans.kind === "short-text") {
    return ans.text.trim().length > 0;
  }
  return true;
}