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