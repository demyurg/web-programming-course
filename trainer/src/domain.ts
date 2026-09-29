
export type TaskKind = "single-choice" | "short-text";

export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  question: string;
  options: string[];
  code?: string; 
};

export type ShortTextTask = {
  id: string;
  kind: "short-text";
  topic: string;
  question: string;
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



export function findTaskById(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}


export function filterTasksByTopic(tasks: Task[], topic: string): Task[] {
  const lowerTopic = topic.toLowerCase();
  return tasks.filter((task) => task.topic.toLowerCase().includes(lowerTopic));
}

export function calculateProgress(tasks: Task[], answers: Answer[]): { filled: number; total: number } {
  const total = tasks.length;
  if (total === 0) return { filled: 0, total: 0 };


  const existingTaskIds = new Set(tasks.map((t) => t.id));

  let filledCount = 0;
  for (const answer of answers) {
    if (!existingTaskIds.has(answer.taskId)) {
      continue;
    }

    if (answer.kind === "short-text") {
      if (answer.text.trim().length > 0) {
        filledCount++;
      }
    } else {
      filledCount++;
    }
  }

  return { filled: filledCount, total };
}