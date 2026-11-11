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
