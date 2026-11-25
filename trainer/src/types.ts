import type { Answer } from "./domain.js";

export type SaveState = {
  status: "idle" | "saving" | "saved" | "error";
  message?: string;
};

export const IDLE_SAVE: SaveState = { status: "idle" };

export function isAnswered(answer: Answer | undefined): boolean {
  if (!answer) return false;
  return answer.kind === "single-choice"
    ? answer.optionId.length > 0
    : answer.text.trim().length > 0;
}
