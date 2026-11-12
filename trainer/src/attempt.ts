import type { Answer, TrainingSet, Task } from "./domain";
import { isAnswered } from "./domain";

// Состояние всей попытки
export type AttemptState = {
  answers: Answer[];
  currentIndex: number;
  status: "in-progress" | "submitted";
};

// Действия, которые могут происходить в попытке
export type AttemptAction =
  | { type: "answer"; answer: Answer }
  | { type: "go"; index: number }
  | { type: "clear"; taskId: string }
  | { type: "finish" }
  | { type: "restart" };

// Тип возвращаемого объекта
export type ClearResult =
  | { ok: true; state: AttemptState }
  | { ok: false; message: string };

// Правило удаления ответа 
export function clearAnswer(state: AttemptState, taskId: string): ClearResult {
  // нельзя менять завершённую попытку
  if (state.status === "submitted") {
    return { ok: false, message: "Попытка завершена, изменение невозможно." };
  }

  // удаляем ответ с этим taskId (если он был)
  return {
    ok: true,
    state: {
      ...state,
      answers: state.answers.filter((a) => a.taskId !== taskId),
    },
  };
}

// Правило поиска пропущенных заданий
export function getMissedTasks(set: TrainingSet, state: AttemptState): Task[] {
  return set.tasks.filter((task) => {
    const answer = state.answers.find((a) => a.taskId === task.id);
    return !isAnswered(task, answer);
  });
}

//
export function attemptReducer(
  state: AttemptState,
  action: AttemptAction,
  set: TrainingSet,
): AttemptState {
  switch (action.type) {
    case "answer": {
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: [
          ...state.answers.filter((a) => a.taskId !== action.answer.taskId),
          action.answer,
        ],
      };
    }

    case "go": {
      const maxIndex = set.tasks.length - 1;
      const nextIndex = Math.max(0, Math.min(action.index, maxIndex));
      return { ...state, currentIndex: nextIndex };
    }

    case "clear": {
      const result = clearAnswer(state, action.taskId);
      return result.ok ? result.state : state;
    }

    case "finish": {
      return { ...state, status: "submitted" };
    }

    case "restart": {
      return { answers: [], currentIndex: 0, status: "in-progress" };
    }
  }
}