export type SingleChoiceTask = {
  id: string;
  kind: "single-choice";
  topic: string;
  prompt: string;
  code?: string;
  options: {
    id: string;
    label: string;
  }[];
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

export type Attempt = {
  answers: Answer[];
  submitted: boolean;
};

export type TrainingSet = {
  id: string;
  title: string;
  tasks: Task[];
};

export function findTask(tasks: Task[], id: string): Task | undefined {
  return tasks.find(task => task.id === id);
}

export function filterTasksByTopic(tasks: Task[], topic: string): Task[] {
  return tasks.filter(task => task.topic === topic);
}
/*export function filterTasksByText(tasks: Task[], text: string): Task[] {
  return tasks.filter(task => task.prompt.includes(text) || (task.kind === 'single-choice' && task.options.find(opt => opt.label.includes(text))));
}*/
export function getProgress(tasks: Task[], answers: Answer[]): {
  filled: number;
  total: number;
} {
  let filled = 0;

  for (const task of tasks) {
    const answer = answers.find(answer => answer.taskId === task.id);

    if (!answer) {
      continue;
    }

    if (answer.kind === "short-text" && answer.text.trim() === "") {
      continue;
    }

    filled++;
  }

  return {
    filled: filled,
    total: tasks.length
  };
}

export function updateAnswer(attempt: Attempt, newAnswer: Answer): Attempt {
  if (attempt.submitted) {
    return attempt;
  }

  const existingAnswer = attempt.answers.find(
    (answer) => answer.taskId === newAnswer.taskId
  );

  let updatedAnswers: Answer[];

  if (existingAnswer) {
    updatedAnswers = attempt.answers.map((answer) => {
      if (answer.taskId === newAnswer.taskId) {
        return newAnswer;
      }

      return answer;
    });
  } else {
    updatedAnswers = [...attempt.answers, newAnswer];
  }

  return {...attempt, answers: updatedAnswers,
  };
}

export function clearAnswer(attempt: Attempt, taskId: string): Attempt {
  if (attempt.submitted) {
    return attempt;
  }

  return {...attempt, answers: attempt.answers.filter((answer) => answer.taskId !== taskId),
  };
} 

export function finishAttempt(attempt: Attempt): Attempt {
  if (attempt.submitted) {
    return attempt;
  }

  return {...attempt, submitted: true,
  };
}