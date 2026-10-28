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

function isAnswerFilled(answer: Answer): boolean {
  if (answer.kind === "single-choice") {
    return true;
  }

  return answer.text.trim() !== "";
}

export function countProgress(
  trainingSet: TrainingSet,
  answers: Answer[]
): Progress {
  const total = trainingSet.tasks.length;
  let filled = 0;

  for (const task of trainingSet.tasks) {
    const answer = answers.find((item) => item.taskId === task.id);

    if (answer !== undefined && isAnswerFilled(answer)) {
      filled = filled + 1;
    }
  }

  return { filled, total };
}
