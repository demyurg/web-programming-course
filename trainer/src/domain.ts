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
  tasks: readonly Task[];
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

export function findTaskById(
  tasks: readonly Task[],
  taskId: string
): Task | undefined {
  return tasks.find((task) => task.id === taskId);
}

export function filterTasksByTopic(
  tasks: readonly Task[],
  topic: string
): Task[] {
  return tasks.filter((task) => task.topic === topic);
}

export function isAnswerFilled(answer: Answer): boolean {
  if (answer.kind === "short-text") {
    return answer.text.trim() !== "";
  }

  return answer.optionId !== "";
}

export function calculateProgress(
  bts: TrainingSet,
  answers: readonly Answer[]
): { filled: number; total: number } {
  let filled = 0;

  for (const task of bts.tasks) {
    const answer = answers.find((i) => i.taskId === task.id);
    if (answer !== undefined && isAnswerFilled(answer)) {
      filled += 1;
    }
  }
  return {
    filled,
    total: bts.tasks.length,
  };
}