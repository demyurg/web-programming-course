import {
    type Answer,
    type TrainingSet,
    calculateProgress,
    filterTasksByTopic,
    findTask,
} from "./domain";

const trainingSet: TrainingSet = {
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

const secondTrainingSet: TrainingSet = {
    id: "second-set",
    title: "Дополнительный набор",
    tasks: [
        {
            id: "second-1",
            kind: "short-text",
            topic: "html",
            prompt: "Что такое HTML?",
        },
    ],
};

const emptyTrainingSet: TrainingSet = {
    id: "empty-set",
    title: "Пустой набор",
    tasks: [],
};

const answers: Answer[] = [
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

const oneAnswer: Answer[] = [
    {
        taskId: "ts-1",
        kind: "single-choice",
        optionId: "b",
    },
];

const answersWithUnknownTask: Answer[] = [
    ...oneAnswer,
    {
        taskId: "unknown-task",
        kind: "short-text",
        text: "Ответ",
    },
];

const answersWithBlankText: Answer[] = [
    {
        taskId: "react-1",
        kind: "short-text",
        text: "   ",
    },
];

console.log("Существующее задание:");
console.log(findTask(trainingSet, "ts-1"));

console.log("Несуществующее задание:");
console.log(findTask(trainingSet, "unknown-task"));

console.log("Фильтр по теме typescript:");
console.log(filterTasksByTopic(trainingSet, "typescript"));

console.log("Фильтр по отсутствующей теме:");
console.log(filterTasksByTopic(trainingSet, "unknown"));

console.log("Задания второго набора:");
console.log(filterTasksByTopic(secondTrainingSet, "html"));

console.log("Прогресс с одним ответом:");
console.log(calculateProgress(trainingSet, oneAnswer));

console.log("Прогресс со всеми ответами:");
console.log(calculateProgress(trainingSet, answers));

console.log("Прогресс с чужим taskId:");
console.log(calculateProgress(trainingSet, answersWithUnknownTask));

console.log("Прогресс с пустым short-text:");
console.log(calculateProgress(trainingSet, answersWithBlankText));

console.log("Прогресс пустого набора:");
console.log(calculateProgress(emptyTrainingSet, []));

console.log("Исходный набор после вызовов:");
console.log(trainingSet);

console.log("Исходные ответы после вызовов:");
console.log(answers);
