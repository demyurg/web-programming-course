export type Option = {
  id: string;
  label: string;
};

export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  prompt: string;
  code?: string;
  options: Option[];
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

export type AttemptStatus = "in-progress" | "submitted";

export type AttemptState = {
  currentIndex: number;
  answers: Answer[];
  status: AttemptStatus;
};

export type AttemptAction =
  | { type: "answer-changed"; answer: Answer }
  | { type: "answer-cleared"; taskId: string }
  | { type: "moved"; index: number; taskCount: number }
  | { type: "submitted" }
  | { type: "reset" };

export type FormEvent =
  | { type: "choose-option"; taskId: string; optionId: string }
  | { type: "change-text"; taskId: string; text: string };

export type Progress = {
  filled: number;
  total: number;
};

export function findTaskById(
  trainingSet: TrainingSet,
  taskId: string
): Task | undefined {
  return trainingSet.tasks.find((task) => task.id === taskId);
}

export function filterTasksByTopic(
  trainingSet: TrainingSet,
  topic: string
): Task[] {
  return trainingSet.tasks.filter((task) => task.topic === topic);
}

export function getAnswer(
  answers: Answer[],
  taskId: string
): Answer | undefined {
  return answers.find((item) => item.taskId === taskId);
}

export function isAnswered(answer: Answer | undefined): answer is Answer {
  if (!answer) {
    return false;
  }

  return answer.kind === "single-choice"
    ? answer.optionId.length > 0
    : answer.text.trim().length > 0;
}

export function countProgress(
  trainingSet: TrainingSet,
  answers: Answer[]
): Progress {
  const total = trainingSet.tasks.length;
  let filled = 0;

  for (const task of trainingSet.tasks) {
    const answer = getAnswer(answers, task.id);

    if (isAnswered(answer)) {
      filled = filled + 1;
    }
  }

  return { filled, total };
}

export function createAttemptState(): AttemptState {
  return {
    currentIndex: 0,
    answers: [],
    status: "in-progress",
  };
}

export function replaceAnswer(answers: Answer[], next: Answer): Answer[] {
  return [...answers.filter((item) => item.taskId !== next.taskId), next];
}

export function clearAnswer(answers: Answer[], taskId: string): Answer[] {
  return answers.filter((item) => item.taskId !== taskId);
}

export function clampIndex(index: number, taskCount: number): number {
  const lastIndex = Math.max(taskCount - 1, 0);

  if (index < 0) {
    return 0;
  }

  if (index > lastIndex) {
    return lastIndex;
  }

  return index;
}

export function applyAttemptAction(
  state: AttemptState,
  action: AttemptAction
): AttemptState {
  if (action.type === "reset") {
    return createAttemptState();
  }

  if (action.type === "moved") {
    return {
      ...state,
      currentIndex: clampIndex(action.index, action.taskCount),
    };
  }

  if (state.status === "submitted") {
    return state;
  }

  if (action.type === "answer-changed") {
    return {
      ...state,
      answers: replaceAnswer(state.answers, action.answer),
    };
  }

  if (action.type === "answer-cleared") {
    return {
      ...state,
      answers: clearAnswer(state.answers, action.taskId),
    };
  }

  if (action.type === "submitted") {
    return {
      ...state,
      status: "submitted",
    };
  }

  return state;
}
