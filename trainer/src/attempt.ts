import type { Answer, Task, TrainingSet } from "./domain";
import { findTask, isAnswerFilled } from "./domain";

export type AttemptStatus = "in-progress" | "submitted";

export type State = {
  version: 1;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: AttemptStatus;
};

export type Action =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerCleared"; taskId: string }
  | { type: "moved"; taskId: string }
  | { type: "restored"; state: State }
  | { type: "reset"; setId: string; initialTaskId: string }
  | { type: "submitted" };

export function createInitialAttempt(set: TrainingSet): State {
  return {
    version: 1,
    setId: set.id,
    taskId: set.tasks[0]?.id ?? "",
    answers: [],
    status: "in-progress",
  };
}

export function setAnswer(state: State, answer: Answer): State {
  if (state.status === "submitted") {
    return state;
  }

  const exists = state.answers.some((a) => a.taskId === answer.taskId);
  const nextAnswers = exists
    ? state.answers.map((a) => (a.taskId === answer.taskId ? answer : a))
    : [...state.answers, answer];

  return {
    ...state,
    answers: nextAnswers,
  };
}

export function clearAnswer(state: State, taskId: string): State {
  if (state.status === "submitted") {
    return state;
  }

  const exists = state.answers.some((a) => a.taskId === taskId);
  if (!exists) {
    return state;
  }

  return {
    ...state,
    answers: state.answers.filter((a) => a.taskId !== taskId),
  };
}

export function moveToTask(state: State, taskId: string): State {
  if (state.status === "submitted") {
    return state;
  }

  return {
    ...state,
    taskId,
  };
}

export function submitAttempt(state: State): State {
  if (state.status === "submitted") {
    return state;
  }

  return {
    ...state,
    status: "submitted",
  };
}

export function getUnansweredTasks(set: TrainingSet, answers: Answer[]): Task[] {
  return set.tasks.filter((task) => {
    const answer = answers.find((a) => a.taskId === task.id);
    return !isAnswerFilled(task, answer);
  });
}

export function attemptReducer(state: State, action: Action): State {
  switch (action.type) {
    case "answerChanged":
      return setAnswer(state, action.answer);

    case "answerCleared":
      return clearAnswer(state, action.taskId);

    case "moved":
      return moveToTask(state, action.taskId);

    case "submitted":
      return submitAttempt(state);

    case "restored":
      return {
        ...action.state,
        answers: [...action.state.answers],
      };

    case "reset":
      return {
        version: 1,
        setId: action.setId,
        taskId: action.initialTaskId,
        answers: [],
        status: "in-progress",
      };

    default:
      return state;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAnswer(raw: unknown, set: TrainingSet): Answer | null {
  if (!isRecord(raw) || typeof raw.taskId !== "string") {
    return null;
  }

  const task = findTask(set, raw.taskId);
  if (!task) {
    return null;
  }

  if (raw.kind === "single-choice" && task.kind === "single-choice") {
    if (typeof raw.optionId !== "string") return null;
    if (!task.options.some((opt) => opt.id === raw.optionId)) return null;

    return {
      taskId: raw.taskId,
      kind: "single-choice",
      optionId: raw.optionId,
    };
  }

  if (raw.kind === "short-text" && task.kind === "short-text") {
    if (typeof raw.text !== "string") return null;

    return {
      taskId: raw.taskId,
      kind: "short-text",
      text: raw.text,
    };
  }

  return null;
}

export function validateDraft(
  parsed: unknown,
  set: TrainingSet
): { ok: true; state: State } | { ok: false; reason: string } {
  if (!isRecord(parsed)) {
    return { ok: false, reason: "Черновик повреждён: ожидался JSON-объект." };
  }

  if (parsed.version !== 1) {
    return { ok: false, reason: "Неподдерживаемая версия черновика." };
  }

  if (typeof parsed.setId !== "string" || parsed.setId !== set.id) {
    return {
      ok: false,
      reason: `Черновик относится к другому набору (ожидался "${set.id}").`,
    };
  }

  if (parsed.status !== "in-progress" && parsed.status !== "submitted") {
    return { ok: false, reason: "Некорректный статус попытки в черновике." };
  }

  if (typeof parsed.taskId !== "string") {
    return { ok: false, reason: "В черновике отсутствует taskId." };
  }

  if (set.tasks.length > 0 && !findTask(set, parsed.taskId)) {
    return {
      ok: false,
      reason: `Задание "${parsed.taskId}" из черновика отсутствует в наборе.`,
    };
  }

  if (!Array.isArray(parsed.answers)) {
    return { ok: false, reason: "Список ответов в черновике повреждён." };
  }

  const answers: Answer[] = [];
  const seen = new Set<string>();

  for (const item of parsed.answers) {
    const valid = parseAnswer(item, set);
    if (!valid || seen.has(valid.taskId)) {
      return {
        ok: false,
        reason: "Один или несколько ответов в черновике повреждены или несовместимы с набором.",
      };
    }
    seen.add(valid.taskId);
    answers.push(valid);
  }

  return {
    ok: true,
    state: {
      version: 1,
      setId: parsed.setId,
      taskId: parsed.taskId,
      answers,
      status: parsed.status,
    },
  };
}