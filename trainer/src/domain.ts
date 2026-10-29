
export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Task =
  | {
      id: string;
      kind: "single-choice";
      topic: string;
      prompt: string;
      options: {
        id: string;
        label: string;
      }[];
      code?: string;
    }
  | {
      id: string;
      kind: "short-text";
      topic: string;
      prompt: string;
      code?: string;
    };


export type Answer =
  | {
      taskId: string;
      kind: "single-choice";
      optionId: string;
    }
  | {
      taskId: string;
      kind: "short-text";
      text: string;
    };


    
export function findTaskById(
  trainingSet: TrainingSet,
  taskId: string,
): Task | undefined {
  return trainingSet.tasks.find((task) => task.id === taskId);
}


export function filterTasksByTopic(
  trainingSet: TrainingSet,
  topic: string,
): Task[] {
  return trainingSet.tasks.filter((task) => task.topic === topic);
}



export function getProgress(
  trainingSet: TrainingSet,
  answers: Answer[],
): { answered: number; total: number } {
  const answered = trainingSet.tasks.filter((task) =>
    answers.some((answer) => {
      if (answer.taskId !== task.id) {
        return false;
      }

      if (answer.kind === "single-choice") {
        return answer.optionId.trim().length > 0;
      }

      return answer.text.trim().length > 0;
    }),
  ).length;

  return {
    answered,
    total: trainingSet.tasks.length,
  };
}
