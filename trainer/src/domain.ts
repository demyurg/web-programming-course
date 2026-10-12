export type SingleChoiceTask = {
    id: string,
    kind: "single-choice",
    topic: string,
    prompt: string,
    code?: string,
    options: Option[]
};

export type Option = {
    id: string,
    label: string
};

export type ShortTextTask = {
    id: string,
    kind: "short-text",
    topic: string,
    prompt: string,
    code?: string
};

export type Task = SingleChoiceTask | ShortTextTask;

export type TrainingSet = {
    id: string,
    title: string,
    tasks: Task[]
};

export type ChoiceAnswer = {
    kind: "single-choice",
    taskId: string,
    optionId: string
};

export type TextAnswer = {
    kind: "short-text",
    taskId: string,
    text: string
};

export type Answer = ChoiceAnswer | TextAnswer;

export function findTask(set: TrainingSet, id: string): Task | undefined {
    return set.tasks.find(task => task.id === id);
}

export function filterByTopic(set: TrainingSet, topic: string): Task[] | undefined {
    return set.tasks.filter(task => task.topic === topic);
}

function isAnswerFilled(answer: Answer): boolean {
    if (answer.kind === "short-text") {
        return answer.text.trim() !== ""
    }
    return true
}

export function calcProgress(set: TrainingSet, answer: Answer[]): { filled: number, total: number } {
    const total = set.tasks.length;

    const filled = answer.filter(answer =>
        findTask(set, answer.taskId) !== undefined && isAnswerFilled(answer)
    ).length;

    return { filled, total };
}

