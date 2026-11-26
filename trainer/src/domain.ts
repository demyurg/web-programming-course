// ===== Типы =====

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

export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Progress = {
  filled: number;
  total: number;
};

// ===== Чистые функции =====

// 1. Поиск задания по id. Возвращает undefined, если не найдено.
export function findTask(set: TrainingSet, taskId: string): Task | undefined {
  for (const task of set.tasks) {
    if (task.id === taskId) {
      return task;
    }
  }
  return undefined;
}

// 2. Фильтр по теме. Регистр не важен. Пустая строка → все задания.
// Возвращает новый массив, не мутирует вход.
export function filterTasks(tasks: Task[], topic: string): Task[] {
  const query = topic.trim().toLowerCase();
  const result: Task[] = [];

  if (query === "") {
    for (const task of tasks) {
      result.push(task);
    }
    return result;
  }

  for (const task of tasks) {
    if (task.topic.toLowerCase().includes(query)) {
      result.push(task);
    }
  }

  return result;
}

// 3. Прогресс: сколько заданий имеют заполненный ответ.
// - Ответ с чужим taskId не учитывается.
// - Для single-choice optionId должен быть из options.
// - Для short-text строка из пробелов не считается заполненной.
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