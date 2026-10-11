import {
    type Answer,
    type TrainingSet,
    calculateProgress,
    filterTasksByTopic,
    findTaskById,
} from "./domain.js";

const mainSet: TrainingSet = {
    id: "web-basics",
    title: "Основы веб-программирования",
    tasks: [
        {
            id: "ts-1",
            kind: "single-choice",
            topic: "typescript",
            prompt: "Что выведет этот JavaScript-код?",
            code: 'console.log("10" * 5);',
            options: [
                { id: "a", label: "105" },
                { id: "b", label: "50" },
                { id: "c", label: "Ошибка" },
            ],
        },
        {
            id: "react-1",
            kind: "short-text",
            topic: "react",
            prompt: "Объясните, чем props компонента отличаются от его состояния.",
        },
    ],
};

const otherSet: TrainingSet = {
    id: "set-2",
    title: "Другой набор",
    tasks: [
        {
            id: "css-1",
            kind: "short-text",
            topic: "css",
            prompt: "Какое свойство меняет цвет текста?",
        },
    ],
};

const emptySet: TrainingSet = {
    id: "set-empty",
    title: "Пустой набор",
    tasks: [],
};

const answersPartial: Answer[] = [
    {
        taskId: "ts-1",
        kind: "single-choice",
        optionId: "b",
    },
];

const answersFull: Answer[] = [
    {
        taskId: "ts-1",
        kind: "single-choice",
        optionId: "b",
    },
    {
        taskId: "react-1",
        kind: "short-text",
        text: "Props передаются компоненту, а состояние хранится внутри компонента.",
    },
];

const answersWithWhitespace: Answer[] = [
    {
        taskId: "ts-1",
        kind: "single-choice",
        optionId: "b",
    },
    {
        taskId: "react-1",
        kind: "short-text",
        text: "   ",
    },
];

const answersWithUnknownTask: Answer[] = [
    {
        taskId: "unknown-id",
        kind: "short-text",
        text: "Ответ",
    },
    {
        taskId: "ts-1",
        kind: "single-choice",
        optionId: "b",
    },
];

console.log("1. Поиск задания");

console.log(
    "Найден ts-1:",
    findTaskById(mainSet.tasks, "ts-1")?.prompt
);

console.log(
    "Отсутствующий id:",
    findTaskById(mainSet.tasks, "missing-id")
);

console.log("\n2. Фильтрация");

console.log(
    "Фильтр typescript:",
    filterTasksByTopic(mainSet.tasks, "typescript")
);

console.log(
    "Фильтр python:",
    filterTasksByTopic(mainSet.tasks, "python")
);

console.log(
    "Фильтр пустого набора:",
    filterTasksByTopic(emptySet.tasks, "typescript")
);

console.log(
    "Фильтр второго набора:",
    filterTasksByTopic(otherSet.tasks, "css")
);

console.log("\n3. Прогресс");

console.log(
    "Пустой набор:",
    calculateProgress(emptySet.tasks, [])
);

console.log(
    "Частичный ответ:",
    calculateProgress(mainSet.tasks, answersPartial)
);

console.log(
    "Полный ответ:",
    calculateProgress(mainSet.tasks, answersFull)
);

console.log(
    "Пробельный short-text:",
    calculateProgress(mainSet.tasks, answersWithWhitespace)
);

console.log(
    "Чужой taskId:",
    calculateProgress(mainSet.tasks, answersWithUnknownTask)
);

console.log("\n4. Проверка неизменности");

const tasksBefore = JSON.stringify(mainSet.tasks);
const answersBefore = JSON.stringify(answersFull);

findTaskById(mainSet.tasks, "ts-1");
filterTasksByTopic(mainSet.tasks, "typescript");
calculateProgress(mainSet.tasks, answersFull);

console.log(
    "Исходные задания не изменены:",
    JSON.stringify(mainSet.tasks) === tasksBefore
);

console.log(
    "Исходные ответы не изменены:",
    JSON.stringify(answersFull) === answersBefore
);