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

export function findTaskById(
  trainingSet: TrainingSet,
  taskId: string
): Task | undefined {
  return trainingSet.tasks.find((task) => task.id === taskId);
}

export function filterTasksByTopic(
  trainingSet: TrainingSet,
  topic: string
): Task[] {
  return trainingSet.tasks.filter((task) => task.topic === topic);
}

export type Progress = {
  completed: number;
  total: number;
};

export function calculateProgress(
  trainingSet: TrainingSet,
  answers: Answer[]
): Progress {
  const completed = trainingSet.tasks.filter((task) => {
    const answer = answers.find((answer) => answer.taskId === task.id);

    if (!answer) {
      return false;
    }

    if (answer.kind === "short-text") {
      return answer.text.trim().length > 0;
    }

    return true;
  }).length;

  return {
    completed,
    total: trainingSet.tasks.length
  };
}

export function updateAnswer(attempt: Attempt, newAnswer: Answer): Attempt {
  if (attempt.submitted) {
    return attempt;
  }

  const existingAnswer = attempt.answers.some(
    (answer) => answer.taskId === newAnswer.taskId
  );

  const answers = existingAnswer
    ? attempt.answers.map((answer) =>
        answer.taskId === newAnswer.taskId ? newAnswer : answer
      )
    : [...attempt.answers, newAnswer];

  return {
    ...attempt,
    answers
  };
}

export function clearAnswer(attempt: Attempt, taskId: string): Attempt {
  if (attempt.submitted) {
    return attempt;
  }

  return {
    ...attempt,
    answers: attempt.answers.filter(
      (answer) => answer.taskId !== taskId
    )
  };
}

export function submitAttempt(attempt: Attempt): Attempt {
  if (attempt.submitted) {
    return attempt;
  }

  return {
    ...attempt,
    submitted: true
  };
}