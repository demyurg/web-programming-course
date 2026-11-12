
import type { Answer, Task, TaskId, TrainingSet } from "./domain";

export const DRAFT_VERSION = 1 as const;

export type AttemptStatus = "in-progress" | "submitted";

export type Draft = {
  version: typeof DRAFT_VERSION;
  setId: string;
  taskId: TaskId;
  answers: Answer[];
  status: AttemptStatus;
};

export type AttemptAction =
  | { type: "answerChanged"; answer: Answer }
  | { type: "moved"; taskId: TaskId }
  | { type: "restored"; draft: Draft }
  | { type: "reset"; draft: Draft }
  | { type: "submitted" };

export type AttemptState = Draft;

export type DraftProblem =
  | "malformed-json"
  | "wrong-shape"
  | "unsupported-version"
  | "foreign-set"
  | "invalid-status"
  | "unknown-task"
  | "duplicate-answer"
  | "invalid-answer";

export type DraftValidation =
  | { kind: "valid"; draft: Draft }
  | { kind: "invalid"; problem: DraftProblem; message: string };

export function createInitialDraft(set: TrainingSet): Draft {
  return {
    version: DRAFT_VERSION,
    setId: set.id,
    taskId: set.tasks[0]?.id ?? "",
    answers: [],
    status: "in-progress",
  };
}

export function createAttemptReducer(tasks: readonly Task[]) {
  const taskById = new Map(tasks.map(task => [task.id, task]));

  return (state: AttemptState, action: AttemptAction): AttemptState => {
    switch (action.type) {
      case "answerChanged": {
        if (state.status === "submitted") return state;

        const answer = action.answer;
        const task = taskById.get(answer.taskId);

        if (!task || task.kind !== answer.kind) return state;

        if (
          answer.kind === "single-choice" &&
          !task.options.some(option => option.id === answer.optionId)
        ) {
          return state;
        }

        const exists = state.answers.some(
          item => item.taskId === answer.taskId
        );

        const answers = exists
          ? state.answers.map(item =>
              item.taskId === answer.taskId ? answer : item
            )
          : [...state.answers, answer];

        return { ...state, answers };
      }

      case "moved":
        return taskById.has(action.taskId)
          ? { ...state, taskId: action.taskId }
          : state.taskId === action.taskId
            ? state
            : state;

      case "restored":
      case "reset":
        return action.draft;

      case "submitted":
        return state.status === "submitted"
          ? state
          : { ...state, status: "submitted" };

      default: {
        const exhaustiveCheck: never = action;
        return exhaustiveCheck;
      }
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(
  problem: DraftProblem,
  message: string
): DraftValidation {
  return { kind: "invalid", problem, message };
}

export function parseDraft(raw: string, set: TrainingSet): DraftValidation {
  let data: unknown;

  try {
    data = JSON.parse(raw);
  } catch {
    return invalid(
      "malformed-json",
      "Черновик повреждён: не удалось прочитать JSON."
    );
  }

  if (!isRecord(data)) {
    return invalid("wrong-shape", "Черновик повреждён: неверный формат данных.");
  }

  if (data.version !== DRAFT_VERSION) {
    return invalid(
      "unsupported-version",
      "Черновик создан несовместимой версией приложения."
    );
  }

  if (data.setId !== set.id) {
    return invalid(
      "foreign-set",
      "Найден черновик другого набора. Его нельзя показать как текущую попытку."
    );
  }

  if (data.status !== "in-progress" && data.status !== "submitted") {
    return invalid(
      "invalid-status",
      "Черновик повреждён: неизвестный статус попытки."
    );
  }

  const taskById = new Map(set.tasks.map(task => [task.id, task]));

  if (typeof data.taskId !== "string" || !taskById.has(data.taskId)) {
    return invalid(
      "unknown-task",
      "Черновик ссылается на задание, которого нет в текущем наборе."
    );
  }

  if (!Array.isArray(data.answers)) {
    return invalid(
      "wrong-shape",
      "Черновик повреждён: ответы должны быть массивом."
    );
  }

  const answers: Answer[] = [];
  const seen = new Set<string>();

  for (const item of data.answers) {
    if (!isRecord(item) || typeof item.taskId !== "string") {
      return invalid(
        "invalid-answer",
        "Черновик повреждён: ответ имеет неверный формат."
      );
    }

    const task = taskById.get(item.taskId);

    if (!task) {
      return invalid(
        "invalid-answer",
        "Черновик содержит ответ на задание, которого нет в наборе."
      );
    }

    if (seen.has(item.taskId)) {
      return invalid(
        "duplicate-answer",
        "Черновик повреждён: для одного задания найдено несколько ответов."
      );
    }

    seen.add(item.taskId);

    if (task.kind === "single-choice") {
      if (
        item.kind !== "single-choice" ||
        typeof item.optionId !== "string" ||
        !task.options.some(option => option.id === item.optionId)
      ) {
        return invalid(
          "invalid-answer",
          "Черновик содержит некорректный вариант ответа."
        );
      }

      answers.push({
        taskId: item.taskId,
        kind: "single-choice",
        optionId: item.optionId,
      });
    } else {
      if (item.kind !== "short-text" || typeof item.text !== "string") {
        return invalid(
          "invalid-answer",
          "Черновик повреждён: текстовый ответ должен быть строкой."
        );
      }

      answers.push({
        taskId: item.taskId,
        kind: "short-text",
        text: item.text,
      });
    }
  }

  return {
    kind: "valid",
    draft: {
      version: DRAFT_VERSION,
      setId: set.id,
      taskId: data.taskId,
      answers,
      status: data.status,
    },
  };
}
