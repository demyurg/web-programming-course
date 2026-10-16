export interface Option {
  id: string;
  label: string;
}

export interface BaseTask {
  id: string;
  prompt: string;
  topic: string;
  code?: string;
}

export interface SingleChoiceTask extends BaseTask {
  kind: 'single-choice';
  options: Option[];
}

export interface ShortTextTask extends BaseTask {
  kind: 'short-text';
}

export type Task = SingleChoiceTask | ShortTextTask;


export interface TrainingSet {
  id: string;
  title: string;
  tasks: Task[];
}

export interface SingleChoiceAnswer {
  taskId: string;
  kind: 'single-choice';
  optionId: string;
}

export interface ShortTextAnswer {
  taskId: string;
  kind: 'short-text';
  text: string;
}

export type Answer = SingleChoiceAnswer | ShortTextAnswer;

export function findTaskById(tasks: readonly Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

export function filterTasksByTopic(tasks: readonly Task[], topic: string): Task[] {
  const lowerTopic = topic.toLowerCase();
  return tasks.filter((task) => task.topic.toLowerCase().includes(lowerTopic));
}

export interface ProgressResult {
  filled: number;
  total: number;
}

export function calculateProgress(set: TrainingSet, answers: readonly Answer[]): ProgressResult {
  const total = set.tasks.length;
  if (total === 0) {
    return { filled: 0, total: 0 };
  }

  let filled = 0;

  for (const task of set.tasks) {
    const answer = answers.find((ans) => ans.taskId === task.id);

    if (answer && answer.kind === task.kind) {
      if (answer.kind === 'single-choice' && task.kind === 'single-choice') {
        const optionExists = task.options.some((opt) => opt.id === answer.optionId);
        if (optionExists) {
          filled++;
        }
      } else if (answer.kind === 'short-text' && task.kind === 'short-text') {
        if (answer.text.trim().length > 0) {
          filled++;
        }
      }
      
    }
  }

  return { filled, total };
}
