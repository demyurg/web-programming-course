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

function isFilled(answer: Answer): boolean {
  if (answer.kind === "short-text") {
    return answer.text.trim() !== "";
  }
  return true;
}

export function countProgress(set: TrainingSet, answers: Answer[]): Progress {
  const filled = answers.filter((answer) => {
    const task = findTask(set, answer.taskId);
    return task !== undefined && isFilled(answer);
  }).length;

  return { filled, total: set.tasks.length };
}
