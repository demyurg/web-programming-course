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

export type Progress = {
    answered: number;
    total: number;
};

export function isAnswered(task: Task, answer: Answer | undefined): boolean {
    if (!answer || answer.taskId !== task.id || answer.kind !== task.kind) {
        return false;
    }

    return answer.kind === "short-text"
        ? answer.text.trim().length > 0
        : answer.optionId.length > 0;
}

export function findTask(
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

export function calculateProgress(
    trainingSet: TrainingSet,
    answers: Answer[]
): Progress {
    const answered = trainingSet.tasks.filter(
        (task) => isAnswered(task, answers.find((answer) => answer.taskId === task.id))
    ).length;

    return {
        answered,
        total: trainingSet.tasks.length,
    };
}
