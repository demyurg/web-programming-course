import type { AttemptState, AttemptAction } from "../utils/draftValidation.js";

// Функция переходов состояния попытки.
export function reducer(state: AttemptState, action: AttemptAction): AttemptState {
  switch (action.type) {
    case "answerChanged":
      if (state.status === "submitted") return state;
      // Ответ с пустым текстом — удаляем ответ вместо добавления
      if (
        action.answer.kind === "short-text" &&
        action.answer.text.trim().length === 0
      ) {
        return {
          ...state,
          answers: state.answers.filter((a) => a.taskId !== action.answer.taskId),
        };
      }
      return {
        ...state,
        answers: [
          ...state.answers.filter((a) => a.taskId !== action.answer.taskId),
          action.answer,
        ],
      };
    case "answerRemoved":
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: state.answers.filter((a) => a.taskId !== action.taskId),
      };
    case "moved":
      return { ...state, currentIndex: action.index };
    case "reset":
      return {
        currentIndex: 0,
        answers: [],
        status: "in-progress",
        storageWarning: undefined,
        attemptId: null,
      };
    case "restored":
      return {
        ...state,
        currentIndex: 0,
        answers: action.draft.answers,
        status: action.draft.status,
        attemptId: action.draft.attemptId ?? null,
      };
    case "submitted":
      return { ...state, status: "submitted" };
    case "attemptLoaded":
      return {
        ...state,
        attemptId: action.attemptId,
        answers: action.answers,
      };
    default:
      return state;
  }
}