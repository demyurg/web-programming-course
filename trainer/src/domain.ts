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
  tasks: Task[];
};

export type Answer =
  | { taskId: string; kind: "single-choice"; optionId: string }
  | { taskId: string; kind: "short-text"; text: string };

export type Progress = {
  filled: number;
  total: number;
};

export function findTaskById(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

export function filterTasksByTopic(tasks: Task[], topic: string): Task[] {
  return tasks.filter((task) => task.topic === topic);
}

export function calculateProgress(tasks: Task[], answers: Answer[]): Progress {
  const answeredTaskIds = new Set(
    answers
      .filter((answer) => {
        if (answer.kind === "short-text") {
          return answer.text.trim().length > 0;
        }
        return true;
      })
      .map((answer) => answer.taskId)
  );

  const filled = tasks.filter((task) => answeredTaskIds.has(task.id)).length;

  return {
    filled,
    total: tasks.length,
  };
}

// НОВОЕ для L3: Неизменяемое обновление ответа
export function updateAnswer(answers: Answer[], newAnswer: Answer): Answer[] {
  const others = answers.filter((a) => a.taskId !== newAnswer.taskId);
  
  // Если текстовый ответ пустой или состоит из пробелов, удаляем его из массива
  if (newAnswer.kind === "short-text" && newAnswer.text.trim() === "") {
    return others;
  }
  
  return [...others, newAnswer];
}

// НОВОЕ для L3: Получение ID незаполненных заданий
export function getUnansweredTaskIds(tasks: Task[], answers: Answer[]): string[] {
  return tasks
    .filter((task) => {
      const answer = answers.find((a) => a.taskId === task.id);
      if (!answer) return true;
      if (answer.kind === "short-text" && answer.text.trim() === "") return true; 
      return false;
    })
    .map((t) => t.id);
}