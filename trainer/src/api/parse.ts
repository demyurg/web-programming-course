import type { Answer, Option, Task, TrainingSet } from "../domain";
import type {
  Result,
  ResultItem,
  ServerAttempt,
  SetSummary,
} from "../server-model";

type Json = Record<string, unknown>;

const ATTEMPT_STATUSES = ["in-progress", "submitted"] as const;
const RESULT_STATUSES = ["graded", "pending-review"] as const;
const ITEM_STATUSES = ["correct", "incorrect", "unanswered", "pending-review"] as const;

function isRecord(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function parseScore(value: unknown): number | null | undefined {
  if (typeof value === "number") return value;
  if (value === null) return null;
  return undefined;
}

function parseList<T>(
  value: unknown,
  parseItem: (item: unknown) => T | undefined,
): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items: T[] = [];
  for (const raw of value) {
    const item = parseItem(raw);
    if (item === undefined) return undefined;
    items.push(item);
  }
  return items;
}

export function parseAnswer(value: unknown): Answer | undefined {
  if (!isRecord(value)) return undefined;
  const { taskId, kind, optionId, text } = value;
  if (typeof taskId !== "string") return undefined;
  if (kind === "single-choice" && typeof optionId === "string") {
    return { taskId, kind: "single-choice", optionId };
  }
  if (kind === "short-text" && typeof text === "string") {
    return { taskId, kind: "short-text", text };
  }
  return undefined;
}

function parseOption(value: unknown): Option | undefined {
  if (!isRecord(value)) return undefined;
  const { id, label } = value;
  if (typeof id !== "string" || typeof label !== "string") return undefined;
  return { id, label };
}

function parseTask(value: unknown): Task | undefined {
  if (!isRecord(value)) return undefined;
  const { id, kind, topic, prompt, code, options } = value;
  if (typeof id !== "string" || typeof topic !== "string" || typeof prompt !== "string") {
    return undefined;
  }
  if (code !== undefined && typeof code !== "string") return undefined;
  const base = { id, topic, prompt, code };

  if (kind === "short-text") {
    return { ...base, kind: "short-text" };
  }
  if (kind === "single-choice") {
    const parsedOptions = parseList(options, parseOption);
    if (parsedOptions === undefined) return undefined;
    return { ...base, kind: "single-choice", options: parsedOptions };
  }
  return undefined;
}

export function parseTrainingSet(value: unknown): TrainingSet | undefined {
  if (!isRecord(value)) return undefined;
  const { id, title, tasks } = value;
  if (typeof id !== "string" || typeof title !== "string") return undefined;
  const parsedTasks = parseList(tasks, parseTask);
  if (parsedTasks === undefined) return undefined;
  return { id, title, tasks: parsedTasks };
}

function parseSetSummary(value: unknown): SetSummary | undefined {
  if (!isRecord(value)) return undefined;
  const { id, title, taskCount } = value;
  if (typeof id !== "string" || typeof title !== "string" || typeof taskCount !== "number") {
    return undefined;
  }
  return { id, title, taskCount };
}

export function parseSetList(value: unknown): SetSummary[] | undefined {
  return parseList(value, parseSetSummary);
}

export function parseAttempt(value: unknown): ServerAttempt | undefined {
  if (!isRecord(value)) return undefined;
  const { id, setId, status, answers } = value;
  if (typeof id !== "string" || typeof setId !== "string") return undefined;
  if (!isOneOf(status, ATTEMPT_STATUSES)) return undefined;
  const parsedAnswers = parseList(answers, parseAnswer);
  if (parsedAnswers === undefined) return undefined;
  return { id, setId, status, answers: parsedAnswers };
}

function parseResultItem(value: unknown): ResultItem | undefined {
  if (!isRecord(value)) return undefined;
  const { taskId, status, score, maxScore, feedback } = value;
  if (typeof taskId !== "string" || typeof maxScore !== "number") return undefined;
  if (!isOneOf(status, ITEM_STATUSES)) return undefined;
  const parsedScore = parseScore(score);
  if (parsedScore === undefined) return undefined;
  return {
    taskId,
    status,
    score: parsedScore,
    maxScore,
    feedback: typeof feedback === "string" ? feedback : "",
  };
}

export function parseResult(value: unknown): Result | undefined {
  if (!isRecord(value)) return undefined;
  const { attemptId, status, score, maxScore, items } = value;
  if (typeof attemptId !== "string" || typeof maxScore !== "number") return undefined;
  if (!isOneOf(status, RESULT_STATUSES)) return undefined;
  const parsedScore = parseScore(score);
  if (parsedScore === undefined) return undefined;
  const parsedItems = parseList(items, parseResultItem);
  if (parsedItems === undefined) return undefined;
  return { attemptId, status, score: parsedScore, maxScore, items: parsedItems };
}


export function parseErrorMessage(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const { error } = value;
  if (!isRecord(error)) return undefined;
  const { message } = error;
  return typeof message === "string" ? message : undefined;
}
