// Тип варианта ответа для задания с выбором 1 варианта
export type TaskOption = {
  id: string;
  label: string;
};

// Задание с выбором 1 варианта ответа
export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  prompt: string;
  code?: string;
  options: TaskOption[];
};

// Задание с текстовым ответом
export type ShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  prompt: string;
  code?: string;
};

// Задание либо с выбором ответа, либо с текстовым ответом
export type Task = SingleChoiceTask | ShortTextTask;

// Набор заданий
export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

// Ответ на задание с выбором ответа
export type SingleChoiceAnswer = {
  taskId: string;
  kind: "single-choice";
  optionId: string;
};

// Ответ на задание с текстовым ответом
export type ShortTextAnswer = {
  taskId: string;
  kind: "short-text";
  text: string;
};

// Ответ, как и задание — либо с выбором ответа, либо с текстовым ответом
export type Answer = SingleChoiceAnswer | ShortTextAnswer;

// Результат расчёта прогресса
export type Progress = {
  filled: number;
  total: number;
};

// Находит задание по его taskId
export function findTask(
  set: TrainingSet,
  taskId: string
): Task | undefined {
  return set.tasks.find((task) => task.id === taskId);
}

// Фильтрует задания по теме, исходный массив не изменяется
export function filterTasks(
  tasks: Task[],
  topic: string
): Task[] {
  const query = topic.trim().toLowerCase();

  if (query === "") {
    return tasks.filter(() => true);
  }

  return tasks.filter((task) =>
    task.topic.toLowerCase().includes(query)
  );
}

export function isAnswerFilled(
  task: Task,
  answer: Answer | undefined
): boolean {
  if (!answer || answer.taskId !== task.id) {
    return false;
  }

  if (task.kind === "single-choice" && answer.kind === "single-choice") {
    return task.options.some((option) => option.id === answer.optionId);
  }

  if (task.kind === "short-text" && answer.kind === "short-text") {
    return answer.text.trim().length > 0;
  }

  return false;
}

export function getProgress(
  set: TrainingSet,
  answers: Answer[]
): Progress {
  const filled = set.tasks.filter((task) => {
    const answer = answers.find((item) => item.taskId === task.id);
    return isAnswerFilled(task, answer);
  }).length;

  return {
    filled,
    total: set.tasks.length,
  };
}