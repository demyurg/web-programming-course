export type SetId = string;
export type TaskId = string;
export type Topic = string;

export type ChoiceOption = {
  id: string;
  label: string;
};

type TaskFields = {
  id: TaskId;
  topic: Topic;
  prompt: string;
  code?: string;
};

export type SingleChoiceTask = TaskFields & {
  kind: "single-choice";
  options: ChoiceOption[];
};

export type ShortTextTask = TaskFields & {
  kind: "short-text";
};

export type Task = SingleChoiceTask | ShortTextTask;

export type TrainingSet = {
  id: SetId;
  title: string;
  tasks: Task[];
};

export type SingleChoiceAnswer = {
  taskId: TaskId;
  kind: "single-choice";
  optionId: string;
};

export type ShortTextAnswer = {
  taskId: TaskId;
  kind: "short-text";
  text: string;
};

export type Answer = SingleChoiceAnswer | ShortTextAnswer;

export type Progress = {
  filled: number;
  total: number;
};

export function findTask(set: TrainingSet, taskId: TaskId): Task | undefined {
  return set.tasks.find((task) => task.id === taskId);
}

export function findAnswer(answers: readonly Answer[], taskId: TaskId): Answer | undefined {
  return answers.find((answer) => answer.taskId === taskId);
}

export function tasksByTopic(set: TrainingSet, topic: Topic): Task[] {
  const wanted = topic.trim().toLowerCase();
  if (wanted === "") {
    return [];
  }
  return set.tasks.filter((task) => task.topic.trim().toLowerCase() === wanted);
}

export function isAnswerFilled(answer: Answer): boolean {
  return answer.kind === "short-text" ? answer.text.trim() !== "" : answer.optionId.trim() !== "";
}

export function countProgress(set: TrainingSet, answers: readonly Answer[]): Progress {
  return {
    filled: set.tasks.filter((task) => isTaskAnswered(task, answers)).length,
    total: set.tasks.length,
  };
}

function isTaskAnswered(task: Task, answers: readonly Answer[]): boolean {
  const answer = findAnswer(answers, task.id);
  return answer !== undefined && answer.kind === task.kind && isAnswerFilled(answer);
}