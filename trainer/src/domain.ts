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
): { filled: number; total: number } {
  const total = set.tasks.length;
  let filled = 0;
  for (const task of set.tasks) {
    const answer = answers.find((a) => a.taskId === task.id);
    if (isAnswer(answer)) {
      filled += 1;
    }
  }
  return { filled, total };
}

export type AttemptStatus = "in-progress" | "submitted";

export type AttemptState = {
  answers: Answer[];
  currentIndex: number;
  status: AttemptStatus;
};

export function isAnswer(answer: Answer | undefined): boolean {
  if (!answer) return false;
  return answer.kind === "single-choice"
    ? answer.optionId.length > 0
    : answer.text.trim().length > 0;
}