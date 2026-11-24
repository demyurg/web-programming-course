import type { Answer, Task, TrainingSet } from "./domain";

export const draftKey = "web-programming-course:trainer:draft";
const draftVersion = 1;

export type Draft = {
  version: typeof draftVersion;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: "in-progress" | "submitted";
};

export type DraftRead =
  | { kind: "restored"; draft: Draft }
  | { kind: "empty" | "invalid" | "foreign" | "unavailable" };

export function emptyDraft(set: TrainingSet): Draft {
  return {
    version: draftVersion,
    setId: set.id,
    taskId: set.tasks[0]?.id ?? "",
    answers: [],
    status: "in-progress",
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseAnswer(value: unknown, tasks: Map<string, Task>): Answer | undefined {
  if (!isObject(value) || typeof value.taskId !== "string") return;
  const taskId = value.taskId;
  const task = tasks.get(taskId);
  if (task?.kind === "short-text" && value.kind === task.kind && typeof value.text === "string") {
    return { taskId, kind: task.kind, text: value.text };
  }
  const optionId = value.optionId;
  if (task?.kind === "single-choice" && value.kind === task.kind &&
      typeof optionId === "string" && task.options.some((option) => option.id === optionId)) {
    return { taskId, kind: task.kind, optionId };
  }
}

export function readDraft(set: TrainingSet): DraftRead {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(draftKey);
  } catch {
    return { kind: "unavailable" };
  }
  if (raw === null) return { kind: "empty" };

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { kind: "invalid" };
  }
  if (!isObject(value) || value.version !== draftVersion || typeof value.setId !== "string" ||
      typeof value.taskId !== "string" || !Array.isArray(value.answers) ||
      (value.status !== "in-progress" && value.status !== "submitted")) {
    return { kind: "invalid" };
  }
  if (value.setId !== set.id) return { kind: "foreign" };

  const tasks = new Map(set.tasks.map((task) => [task.id, task]));
  if (tasks.size === 0 ? value.taskId !== "" : !tasks.has(value.taskId)) {
    return { kind: "invalid" };
  }
  const answers: Answer[] = [];
  const answerIds = new Set<string>();
  for (const item of value.answers) {
    const answer = parseAnswer(item, tasks);
    if (!answer || answerIds.has(answer.taskId)) return { kind: "invalid" };
    answers.push(answer);
    answerIds.add(answer.taskId);
  }
  return {
    kind: "restored",
    draft: { version: draftVersion, setId: set.id, taskId: value.taskId, answers, status: value.status },
  };
}

type StorageState = "loading" | "ready" | "invalid" | "foreign" | "unavailable";

type Attempt = {
  draft: Draft;
  storage: StorageState;
  changed: boolean;
};

type AttemptAction =
  | { type: "restored"; result: DraftRead }
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerCleared"; taskId: string }
  | { type: "moved"; taskId: string }
  | { type: "reset"; set: TrainingSet }
  | { type: "submitted" };

export function initialAttempt(set: TrainingSet): Attempt {
  return { draft: emptyDraft(set), storage: "loading", changed: false };
}

export function attemptReducer(state: Attempt, action: AttemptAction): Attempt {
  const draft = state.draft;
  switch (action.type) {
    case "restored": {
      if (state.storage !== "loading") return state;
      const result = action.result;
      if (result.kind === "restored") return { ...state, draft: result.draft, storage: "ready" };
      return { ...state, storage: result.kind === "empty" ? "ready" : result.kind };
    }
    case "answerChanged": {
      if (draft.status === "submitted") return state;
      const answers = draft.answers.filter((answer) => answer.taskId !== action.answer.taskId);
      return { ...state, draft: { ...draft, answers: [...answers, action.answer] }, changed: true };
    }
    case "answerCleared": {
      if (draft.status === "submitted") return state;
      const answers = draft.answers.filter((answer) => answer.taskId !== action.taskId);
      if (answers.length === draft.answers.length) return state;
      return { ...state, draft: { ...draft, answers }, changed: true };
    }
    case "moved":
      if (draft.taskId === action.taskId) return state;
      return { ...state, draft: { ...draft, taskId: action.taskId }, changed: true };
    case "reset":
      return {
        draft: emptyDraft(action.set),
        storage: state.storage === "unavailable" ? "unavailable" : "ready",
        changed: true,
      };
    case "submitted":
      if (draft.status === "submitted") return state;
      return { ...state, draft: { ...draft, status: "submitted" }, changed: true };
  }
}
