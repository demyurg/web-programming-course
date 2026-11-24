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

export type Progress = {
  filled: number;
  total: number;
};

export function findTask(set: TrainingSet, id: string): Task | undefined {
  return set.tasks.find((task) => task.id === id);
}

export function filterTasks(set: TrainingSet, topic: string): Task[] {
  return set.tasks.filter((task) => task.topic === topic);
}

function isFilled(task: Task, answers: Answer[]): boolean {
  const answer = answers.find((item) => item.taskId === task.id);
  if (answer === undefined) {
    return false;
  }

  if (answer.kind === "short-text") {
    return answer.text.trim() !== "";
  }

  return true;
}

export function countProgress(set: TrainingSet, answers: Answer[]): Progress {
  const filled = set.tasks.filter((task) => isFilled(task, answers)).length;
  return { filled, total: set.tasks.length };
}
