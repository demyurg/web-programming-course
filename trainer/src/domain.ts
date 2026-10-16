export type Option = {
    id: string;
    label: string;
};

export type SingleChoiceTask = {
    id: string;
    kind: "single-choice";
    topic: string;
    prompt: string;
    options: Option[];
    code?: string;
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

export type TrainingSet = {
    id: string;
    title: string;
    tasks: Task[];
};

export type Progress = {
    filled: number;
    total: number;
};

// Поиск задания в массиве 
export function findTask(set: TrainingSet, taskId: string): Task | undefined {
    for (const task of set.tasks) {
        if (task.id === taskId) {
            return task;
        }
    }
    return undefined;
}

// Поиск элементов с нужным топиком
export function filterTasks(tasks: Task[], topic: string): Task[] {
    const filteredTasks: Task[] = [];
    const condition = topic.trim().toLowerCase();

    // Для пустого топика вернем весь массив (новый массив)
    if (condition === "") {
        for (const task of tasks) {
            filteredTasks.push(task);
        }
        return filteredTasks;
    }

    for (const task of tasks) {
        // Проверка на включение в строку
        if (task.topic.toLowerCase().includes(condition)) {
            filteredTasks.push(task);
        }
    }
    return filteredTasks;
}

// Получение общего количества заданий и решенного количества
export function getProgress(set: TrainingSet, answers: Answer[]): Progress {
    const total = set.tasks.length;
    let filled = 0;

    for (const task of set.tasks) {
        //Поиск в ответах ид задания
        const answer = answers.find((a) => a.taskId === task.id);
        if (!answer) {
            continue;
        }

        // Проверка на совпадение типа задания и типа ответа
        if (task.kind === "single-choice" && answer.kind === "single-choice") {
            // Проверка включения ид ответа в списке options
            const hasOption = task.options.some((opt) => opt.id === answer.optionId);
            if (hasOption) {
                filled++;
            }
            continue;
        }

        // Проверка на совпадение типа задания и типа ответа
        if (task.kind === "short-text" && answer.kind === "short-text") {
            // Проверка на наличие ответа 
            if (answer.text.trim() !== "") {
                filled++;
            }
        }
    }

    return { filled, total };
}