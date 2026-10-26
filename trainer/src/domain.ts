// Описание одного варианта ответа для теста
export type Option = {
  id: string;
  label: string;
};

// Задание с выбором одного варианта
export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  prompt: string;
  code?: string;
  options: Option[];
};

// Задание с коротким текстовым ответом
export type ShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  prompt: string;
  code?: string;
};

// Задание - это либо один, либо другой тип
export type Task = SingleChoiceTask | ShortTextTask;

// Набор заданий
export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

// Ответ с выбором варианта
export type SingleChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

// Ответ с текстом
export type ShortTextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

// Ответ - это либо один, либо другой тип
export type Answer = SingleChoiceAnswer | ShortTextAnswer;

// Результат подсчёта прогресса
export type Progress = {
  filled: number;
  total: number;
};

// 1. Найти задание по его id
export function findTask(set: TrainingSet, taskId: string): Task | undefined {
  for (const task of set.tasks) {
    if (task.id === taskId) {
      return task;
    }
  }
  return undefined;
}

// 2. Отфильтровать задания по теме
export function filterTasks(tasks: Task[], topic: string): Task[] {
  const result: Task[] = [];
  for (const task of tasks) {
    if (task.topic.includes(topic)) {
      result.push(task);
    }
  }
  return result;
}

// 3. Посчитать, сколько заданий заполнено
export function getProgress(set: TrainingSet, answers: Answer[]): Progress {
  const total = set.tasks.length;
  let filled = 0;

  for (const task of set.tasks) {
    let answer: Answer | undefined = undefined;
    for (const a of answers) {
      if (a.taskId === task.id) {
        answer = a;
        break;
      }
    }

    if (!answer) {
      continue;
    }

    if (task.kind === "single-choice" && answer.kind === "single-choice") {
      let match = false;
      for (const opt of task.options) {
        if (opt.id === answer.optionId) {
          match = true;
          break;
        }
      }
      if (match) {
        filled = filled + 1;
      }
    }

    if (task.kind === "short-text" && answer.kind === "short-text") {
      if (answer.text.trim().length > 0) {
        filled = filled + 1;
      }
    }
  }

  return { filled: filled, total: total };
}