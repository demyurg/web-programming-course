export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  prompt: string;
  code?: string;
  options: { id: string; label: string }[];
};

export type ShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  prompt: string;
  code?: string;
};

export type Task = SingleChoiceTask | ShortTextTask;

export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

export type SingleChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

export type ShortTextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

export type Answer = SingleChoiceAnswer | ShortTextAnswer;

export function findTaskById(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

export function filterTasksByTopic(tasks: Task[], topic: string): Task[] {
  return tasks.filter((task) => task.topic === topic);
}

export function countProgress(
  set: TrainingSet,
  answers: Answer[],
): { filled: number; total: number; missing: string[] } {
  const total = set.tasks.length;
  const missing: string[] = [];
  let filled = 0;

  for (const task of set.tasks) {
    const answer = answers.find((a) => a.taskId === task.id);
    const ok =
      answer !== undefined &&
      ((task.kind === "single-choice" && answer.kind === "single-choice") ||
        (task.kind === "short-text" &&
          answer.kind === "short-text" &&
          answer.text.trim() !== ""));
    if (ok) filled += 1;
    else missing.push(task.id);
  }

  return { filled, total, missing };
}

// ---------- A4: модель черновика и reducer ----------

export type DraftStatus = "in-progress" | "submitted";

export type Draft = {
  version: 1;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: DraftStatus;
};

export type AttemptAction =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerCleared"; taskId: string }
  | { type: "moved"; taskId: string }
  | { type: "restored"; draft: Draft }
  | { type: "reset"; setId: string; firstTaskId: string }
  | { type: "submitted" };

export function attemptReducer(state: Draft, action: AttemptAction): Draft {
  switch (action.type) {
    case "answerChanged": {
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: [
          ...state.answers.filter((a) => a.taskId !== action.answer.taskId),
          action.answer,
        ],
      };
    }
    case "answerCleared": {
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: state.answers.filter((a) => a.taskId !== action.taskId),
      };
    }
    case "moved": {
      return { ...state, taskId: action.taskId };
    }
    case "restored": {
      return action.draft;
    }
    case "reset": {
      return {
        version: 1,
        setId: action.setId,
        taskId: action.firstTaskId,
        answers: [],
        status: "in-progress",
      };
    }
    case "submitted": {
      if (state.status === "submitted") return state;
      return { ...state, status: "submitted" };
    }
  }
}


export type DraftRead =
  | { kind: "none" }
  | { kind: "invalid"; message: string }
  | { kind: "foreign"; message: string }
  | { kind: "ok"; draft: Draft };

export function readDraft(
  raw: string | null,
  currentSet: TrainingSet,
): DraftRead {
  if (raw === null) return { kind: "none" };

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { kind: "invalid", message: "Черновик повреждён (не JSON)." };
  }

  if (typeof value !== "object" || value === null) {
    return { kind: "invalid", message: "Черновик повреждён (не объект)." };
  }

  const v = value as Record<string, unknown>;

  if (v.version !== 1) {
    return { kind: "invalid", message: "Неизвестная версия черновика." };
  }
  if (typeof v.setId !== "string") {
    return { kind: "invalid", message: "В черновике нет setId." };
  }
  if (v.setId !== currentSet.id) {
    return { kind: "foreign", message: `Черновик от другого набора (${v.setId}).` };
  }
  if (typeof v.taskId !== "string") {
    return { kind: "invalid", message: "В черновике нет taskId." };
  }
  if (v.status !== "in-progress" && v.status !== "submitted") {
    return { kind: "invalid", message: "Неизвестный статус черновика." };
  }
  if (!Array.isArray(v.answers)) {
    return { kind: "invalid", message: "answers — не массив." };
  }

  const answers: Answer[] = [];
  for (const item of v.answers) {
    if (typeof item !== "object" || item === null) {
      return { kind: "invalid", message: "Ответ — не объект." };
    }
    const a = item as Record<string, unknown>;
    if (typeof a.taskId !== "string") {
      return { kind: "invalid", message: "Ответ без taskId." };
    }
    const task = currentSet.tasks.find((t) => t.id === a.taskId);
    if (!task) {
      return { kind: "invalid", message: `Ответ на чужое задание ${a.taskId}.` };
    }
    if (a.kind === "single-choice" && task.kind === "single-choice") {
      if (typeof a.optionId !== "string") {
        return { kind: "invalid", message: "optionId не строка." };
      }
      answers.push({ taskId: a.taskId, kind: "single-choice", optionId: a.optionId });
    } else if (a.kind === "short-text" && task.kind === "short-text") {
      if (typeof a.text !== "string") {
        return { kind: "invalid", message: "text не строка." };
      }
      answers.push({ taskId: a.taskId, kind: "short-text", text: a.text });
    } else {
      return { kind: "invalid", message: "kind ответа не совпадает с заданием." };
    }
  }

  return {
    kind: "ok",
    draft: {
      version: 1,
      setId: v.setId,
      taskId: v.taskId,
      answers,
      status: v.status,
    },
  };
}