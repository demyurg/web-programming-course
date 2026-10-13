

// Базовые поля, которые есть у любого задания
export type TaskBase = {
  id: string;
  topic: string;
  prompt: string;
  code?: string; // Необязательное поле, есть не у всех заданий
};

// Задание с выбором одного варианта ответа
export type SingleChoiceTask = TaskBase & {
  kind: "single-choice";
  options: { id: string; label: string }[];
};

// Задание с коротким текстовым ответом (без options)
export type ShortTextTask = TaskBase & {
  kind: "short-text";
};

// Объединённый тип: задание может быть только одним из двух вариантов
export type Task = SingleChoiceTask | ShortTextTask;

// Набор заданий (тренажёр)
export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

// --- ТИПЫ ОТВЕТОВ ---

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

// Объединённый тип ответа
export type Answer = SingleChoiceAnswer | ShortTextAnswer;

// ============================================================
// ЧИСТЫЕ ФУНКЦИИ
// ============================================================

// 1. Поиск задания по его id.
// Возвращает задание или undefined, если не найдено (без ошибки).
export function findTaskById(
  set: TrainingSet,
  taskId: string
): Task | undefined {
  return set.tasks.find((task) => task.id === taskId);
}

// 2. Фильтрация заданий по теме (регистронезависимый поиск подстроки).
export function filterTasksByTopic(set: TrainingSet, topic: string): Task[] {
  const lowerTopic = topic.toLowerCase();
  return set.tasks.filter((task) =>
    task.topic.toLowerCase().includes(lowerTopic)
  );
}

// 3. Подсчёт прогресса: сколько заданий имеет заполненный ответ.
// Возвращает объект с числом заполненных и общим числом заданий.
export function calculateProgress(
  set: TrainingSet,
  answers: Answer[]
): { completed: number; total: number } {
  const total = set.tasks.length;
  let completed = 0;

  for (const task of set.tasks) {
    // Ищем ответ, который соответствует именно этому заданию по taskId
    const answer = answers.find((a) => a.taskId === task.id);

    // Если ответа нет — переходим к следующему заданию
    if (!answer) continue;

    // Проверяем заполненность в зависимости от типа задания.
    // Проверяем И task.kind, И answer.kind — это нужно для сужения типа (type narrowing),
    // чтобы TypeScript понял, какое именно поле доступно у answer.
    if (task.kind === "short-text" && answer.kind === "short-text") {
      // Метод trim() удаляет пробелы по краям. Если длина > 0, ответ не пустой.
      if (answer.text.trim().length > 0) {
        completed++;
      }
    } else if (
      task.kind === "single-choice" &&
      answer.kind === "single-choice"
    ) {
      // Для single-choice сам факт наличия ответа с правильным taskId означает прогресс.
      completed++;
    }
    // Если kind ответа не совпадает с kind задания — не считаем (по контракту такое не должно
    // происходить для корректных входов, но функция остаётся безопасной).
  }

  return { completed, total };
}