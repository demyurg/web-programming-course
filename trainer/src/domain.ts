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
    filled: number;
    total: number;
};

export function findTaskById(
    tasks: Task[],
    id: string
): Task | undefined {
    return tasks.find((task) => task.id === id);
}

export function filterTasksByTopic(
    tasks: Task[],
    topic: string
): Task[] {
    return tasks.filter((task) => task.topic === topic);
}

export function calculateProgress(
    tasks: Task[],
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

    const filled = tasks.filter(
        (task) => answeredTaskIds.has(task.id)
    ).length;

    return {
        filled,
        total: tasks.length,
    };
}