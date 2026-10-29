
import type { TrainingSet, Answer } from "./domain.js";
import {
  findTaskById,
  filterTasksByTopic,
  getProgress,
} from "./domain.js";


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
    id: "ts-2",
    kind: "single-choice",
    topic: "typescript",
    prompt: "Что возвращает find, если элемент не найден?",
    options: [
      { id: "a", label: "undefined" },
      { id: "b", label: "Пустой массив" },
      { id: "c", label: "false" },
    ],
  },
  {
    id: "react-1",
    kind: "short-text",
    topic: "react",
    prompt: "Объясните, чем props компонента отличаются от его состояния.",
  },
  {
    id: "http-1",
    kind: "short-text",
    topic: "http",
    prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
  },
],

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
    text: "Props передаются компоненту, а состояние хранится внутри него.",
  },
];


console.log("Набор заданий:", trainingSet.title);
console.log("Количество заданий:", trainingSet.tasks.length);
console.log("Ответы:", answers);

const secondTrainingSet: TrainingSet = {
  id: "web-advanced",
  title: "Продвинутые веб-технологии",
  tasks: [
    {
      id: "http-2",
      kind: "short-text",
      topic: "http",
      prompt: "Что означает HTTP-статус 404?",
    },
    {
      id: "ts-3",
      kind: "single-choice",
      topic: "typescript",
      prompt: "Какой тип обозначает текст?",
      options: [
        { id: "a", label: "number" },
        { id: "b", label: "string" },
        { id: "c", label: "boolean" },
      ],
    },
  ],
};

const emptyTrainingSet: TrainingSet = {
  id: "empty-set",
  title: "Пустой набор",
  tasks: [],
};


console.log("Поиск задания ts-1:");
console.log(findTaskById(trainingSet, "ts-1"));

console.log("Поиск несуществующего задания:");
console.log(findTaskById(trainingSet, "unknown"));

console.log("Задания по теме typescript:");
console.log(filterTasksByTopic(trainingSet, "typescript"));

console.log("Задания по несуществующей теме:");
console.log(filterTasksByTopic(trainingSet, "unknown"));

console.log("Прогресс основного набора:");
console.log(getProgress(trainingSet, answers));

console.log("Прогресс пустого набора:");
console.log(getProgress(emptyTrainingSet, []));



console.log("Проверка ответа из пробелов:");
console.log(
  getProgress(trainingSet, [
    {
      taskId: "react-1",
      kind: "short-text",
      text: "   ",
    },
  ]),
);

console.log("Проверка ответа для неизвестного задания:");
console.log(
  getProgress(trainingSet, [
    {
      taskId: "unknown",
      kind: "short-text",
      text: "Какой-то ответ",
    },
  ]),
);

console.log("Проверка одного заполненного ответа:");
console.log(
  getProgress(trainingSet, [
    {
      taskId: "ts-1",
      kind: "single-choice",
      optionId: "b",
    },
  ]),
);

