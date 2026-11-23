import { Attempt, Action, Answer, Task } from "./types";

export function applyAction(state: Attempt, action: Action): Attempt {
  switch (action.type) {
    case "SET_ANSWER": {
      // Правило: после завершения попытки изменение запрещено
      if (state.status === "submitted") return state;

      const filtered = state.answers.filter((a) => a.taskId !== action.answer.taskId);
      
      // Правило: пустой текст считается незаполненным ответом (автоматически очищает его)
      if (action.answer.kind === "short-text" && action.answer.text.trim() === "") {
        return { ...state, answers: filtered };
      }
      
      return { ...state, answers: [...filtered, action.answer] };
    }
    
    case "CLEAR_ANSWER": {
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: state.answers.filter((a) => a.taskId !== action.taskId),
      };
    }
    
    case "SUBMIT":
      return { ...state, status: "submitted" };
      
    case "RESET":
      return { ...state, status: "in_progress", answers: [] };
      
    default:
      return state;
  }
}

// Вспомогательные чистые функции для вычисления производных данных
export function getAnswerForTask(answers: Answer[], taskId: string): Answer | undefined {
  return answers.find((a) => a.taskId === taskId);
}

export function getProgress(answers: Answer[], totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return Math.round((answers.length / totalTasks) * 100);
}

export function getSkippedTaskIds(tasks: Task[], answers: Answer[]): string[] {
  const answeredTaskIds = new Set(answers.map((a) => a.taskId));
  return tasks.filter((t) => !answeredTaskIds.has(t.id)).map((t) => t.id);
}