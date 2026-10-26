export type Option = {
    id: string;
    label: string;
};

export type SingleChoiceTask = {
    id: string;
    kind: "single-choice";
    topic: string;
    prompt: string;
    options: Option[];
    code?: string;
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

// Поиск задания в массиве 
export function findTask(set: TrainingSet, taskId: string): Task | undefined {
    for (const task of set.tasks) {
        if (task.id === taskId) {
            return task;
        }
    }
    return undefined;
}

// Поиск элементов с нужным топиком
export function filterTasks(tasks: Task[], topic: string): Task[] {
    const filteredTasks: Task[] = [];
    const condition = topic.trim().toLowerCase();

    // Для пустого топика вернем весь массив (новый массив)
    if (condition === "") {
        for (const task of tasks) {
            filteredTasks.push(task);
        }
        return filteredTasks;
    }

    for (const task of tasks) {
        // Проверка на включение в строку
        if (task.topic.toLowerCase().includes(condition)) {
            filteredTasks.push(task);
        }
    }
    return filteredTasks;
}

// Проверка решено ли задание или не решено
export function isAnswered(task: Task, answer: Answer | undefined): boolean {
  // Обработка пустого ответа (undefined)
  if (!answer) return false;
  
  // Проверка наличия варианта ответа. some - вернет истину, если хотя бы один элемент удовлетворяет условию
  if (task.kind === "single-choice" && answer.kind === "single-choice") {
    return task.options.some((opt) => opt.id === answer.optionId);
  }

  // Проверка наличия реальных символов (не пробелов)
  if (task.kind === "short-text" && answer.kind === "short-text") {
    return answer.text.trim().length > 0;
  }

  return false;
}

// Получение общего количества заданий и решенного количества
export function getProgress(set: TrainingSet, answers: Answer[]): Progress {
  let filled = 0;
  for (const task of set.tasks) {
    const answer = answers.find((a) => a.taskId === task.id);
    if (isAnswered(task, answer)) {
      filled++;
    }
  }
  return { filled, total: set.tasks.length };
}