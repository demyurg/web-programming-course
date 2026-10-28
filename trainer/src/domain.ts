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

export function findTask(set: TrainingSet, id: string): Task | undefined {
  return set.tasks.find((task) => task.id === id);
}

export function filterByTopic(set: TrainingSet, topic: string): Task[] {
  return set.tasks.filter((task) => task.topic === topic);
}

export function findAnswer(
  answers: Answer[],
  taskId: string,
): Answer | undefined {
  return answers.find((answer) => answer.taskId === taskId);
}

export function isAnswered(answer: Answer | undefined): boolean {
  if (!answer) return false;
  return answer.kind === "single-choice"
    ? answer.optionId.length > 0
    : answer.text.trim().length > 0;
}

export function countProgress(set: TrainingSet, answers: Answer[]): Progress {
  const filled = set.tasks.filter((task) =>
    isAnswered(findAnswer(answers, task.id)),
  ).length;

  return { filled, total: set.tasks.length };
}
