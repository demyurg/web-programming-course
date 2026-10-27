export type TaskBase = {
  id: string;
  topic: string;
  prompt: string;
  code?: string; 
};


export type SingleChoiceTask = TaskBase & {
  kind: "single-choice";
  options: { id: string; label: string }[];
};


export type ShortTextTask = TaskBase & {
  kind: "short-text";
};


export type Task = SingleChoiceTask | ShortTextTask;


export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};



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






export function findTaskById(
  set: TrainingSet,
  taskId: string
): Task | undefined {
  return set.tasks.find((task) => task.id === taskId);
}


export function filterTasksByTopic(set: TrainingSet, topic: string): Task[] {
  const lowerTopic = topic.toLowerCase();
  return set.tasks.filter((task) =>
    task.topic.toLowerCase().includes(lowerTopic)
  );
}


export function calculateProgress(
  set: TrainingSet,
  answers: Answer[]
): { completed: number; total: number } {
  const total = set.tasks.length;
  let completed = 0;

  for (const task of set.tasks) {
   
    const answer = answers.find((a) => a.taskId === task.id);

  
    if (!answer) continue;

 
    if (task.kind === "short-text" && answer.kind === "short-text") {
      
      if (answer.text.trim().length > 0) {
        completed++;
      }
    } else if (
      task.kind === "single-choice" &&
      answer.kind === "single-choice"
    ) {
     
      completed++;
    }
   
  }

  return { completed, total };
}
export const module1: TrainingSet = {
  id: "math-basics",
  title: "Математика: основы",
  tasks: [
    {
      id: "task-1",
      topic: "Арифметика",
      prompt: "Сколько будет 2 + 2?",
      kind: "single-choice",
      options: [
        { id: "opt-a", label: "3" },
        { id: "opt-b", label: "4" },
        { id: "opt-c", label: "5" }
      ]
    },
    {
      id: "task-2",
      topic: "Текстовый ответ",
      prompt: "Напишите слово 'привет' латиницей",
      kind: "short-text"
    },
    {
      id: "task-3",
      topic: "Код",
      prompt: "Что выведет этот код?",
      code: "console.log('Hello, World!');",
      kind: "single-choice",
      options: [
        { id: "opt-x", label: "Hello, World!" },
        { id: "opt-y", label: "undefined" }
      ]
    }
  ]
};