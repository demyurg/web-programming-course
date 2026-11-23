export type TaskKind = "single-choice" | "short-text";

export type Task = {
  id: string;
  kind: TaskKind;
  question: string;
  options?: { id: string; text: string }[];
};

export type Answer =
  | { taskId: string; kind: "single-choice"; optionId: string }
  | { taskId: string; kind: "short-text"; text: string };

export type AttemptStatus = "in_progress" | "submitted";

export type Attempt = {
  id: string;
  status: AttemptStatus;
  answers: Answer[];
};

export type Action =
  | { type: "SET_ANSWER"; answer: Answer }
  | { type: "CLEAR_ANSWER"; taskId: string }
  | { type: "SUBMIT" }
  | { type: "RESET" };