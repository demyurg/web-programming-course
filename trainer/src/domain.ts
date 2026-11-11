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
  answers: Answer[]
): { filled: number; total: number } {
  const total = set.tasks.length;
  let filled = 0; //сколько заполнено 

  for (const task of set.tasks) {
    const answer = answers.find((a) => a.taskId === task.id);
    if (!answer) continue;

    if (task.kind === "single-choice" && answer.kind === "single-choice") {
      filled += 1;
    } else if (task.kind === "short-text" && answer.kind === "short-text") {
      if (answer.text.trim() !== "") {
        filled += 1;
      }}}
  return { filled, total };
}