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

    const answered = trainingSet.tasks.filter(
        (task) => answeredTaskIds.has(task.id)
    ).length;

    return {
        answered,
        total: trainingSet.tasks.length,
    };
}