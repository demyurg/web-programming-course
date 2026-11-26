// ===== A3: типы и функции (без изменений) =====
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

// ===== A4: попытка, правило и обзор =====

export type AttemptStatus = "in-progress" | "submitted";

export type Attempt = {
  setId: string;
  taskId: string;
  answers: Answer[];
  status: AttemptStatus;
};

export type AttemptAction =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerCleared"; taskId: string }
  | { type: "moved"; taskId: string }
  | { type: "submitted" };

export function attemptReducer(state: Attempt, action: AttemptAction): Attempt {
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
    case "submitted": {
      if (state.status === "submitted") return state;
      return { ...state, status: "submitted" };
    }
  }
}

export type ReviewRow = {
  taskId: string;
  prompt: string;
  value: string; // "" если ответа нет
};

export function buildReview(set: TrainingSet, answers: Answer[]): ReviewRow[] {
  return set.tasks.map((task) => {
    const answer = answers.find((a) => a.taskId === task.id);
    let value = "";

    if (answer?.kind === "single-choice" && task.kind === "single-choice") {
      const option = task.options.find((o) => o.id === answer.optionId);
      value = option ? option.label : "";
    } else if (answer?.kind === "short-text") {
      value = answer.text.trim();
    }

    return { taskId: task.id, prompt: task.prompt, value };
  });
}