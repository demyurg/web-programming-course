export type TaskKind = 'single-choice' | 'short-text';

export type Option = {
  id: string;
  label: string;
};

export type SingleChoiceTask = {
  id: string;
  kind: 'single-choice';
  topic: string;
  prompt: string;
  code?: string;
  options: Option[];
};

export type ShortTextTask = {
  id: string;
  kind: 'short-text';
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
  kind: 'single-choice';
  optionId: string;
};

export type ShortTextAnswer = {
  taskId: string;
  kind: 'short-text';
  text: string;
};

export type Answer = SingleChoiceAnswer | ShortTextAnswer;

export type Draft = {
  version: 1;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: "in-progress" | "submitted";
};

// Внутреннее состояние экрана попытки 
export type AttemptState = {
  currentIndex: number;
  answers: Answer[];
  status: "in-progress" | "submitted";
  storageWarning?: string; 
};

// Типы действий для useReducer 
export type AttemptAction = 
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerRemoved"; taskId: string }
  | { type: "moved"; index: number }
  | { type: "reset" }
  | { type: "restored"; draft: Draft }
  | { type: "submitted" };

// Безопасная валидация черновика из хранилища. Проверяет структуру, версию, setId и статус перед возвратом.
export function readDraft(raw: string | null, expectedSetId: string): Draft | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    // Базовая проверка структуры
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      !("setId" in parsed) ||
      !("answers" in parsed) ||
      !("status" in parsed)
    ) {
      throw new Error("Invalid structure");
    }

    const draft = parsed as Draft;

    // Проверка версии и совместимости набора
    if (draft.version !== 1) return null;
    if (draft.setId !== expectedSetId) return null;

    // Проверка статуса
    if (draft.status !== "in-progress" && draft.status !== "submitted") {
      return null;
    }

    // Проверка массива ответов
    if (!Array.isArray(draft.answers)) return null;

    return draft;
  } catch {
    return null; 
  }
}

// Поиск задания по идентификатору 
export function findTask(set: TrainingSet, id: string): Task | undefined {
  return set.tasks.find((task) => task.id === id);
}

// Фильтрация заданий по теме 
export function filterTasks(tasks: Task[], topic: string): Task[] {
  return tasks.filter((task) => 
    task.topic.toLowerCase().includes(topic.toLowerCase())
  );
}



// Подсчёт прогресса: заполненные / всего 
export function getProgress(
  set: TrainingSet, 
  answers: Answer[]
): { completed: number; total: number } {
  const total = set.tasks.length;
  if (total === 0) return { completed: 0, total: 0 };

  let completed = 0;
  
  for (const task of set.tasks) {
    const answer = answers.find(a => a.taskId === task.id);
    
    
    if (!answer || answer.kind !== task.kind) continue;

    if (answer.kind === 'short-text') {
      
      if (answer.text.trim().length > 0) {
        completed++;
      }
    } else {
      completed++;
    }
  }

  return { completed, total };
}