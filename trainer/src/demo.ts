import {
  TrainingSet,
  Task,
  Answer,
  findTaskById,
  filterTasksByTopic,
  calculateProgress,
} from "./domain.js"; 


const taskTs1: Task = {
  id: "ts-1",
  kind: "single-choice",
  topic: "typescript",
  question: "Какой тип описывает объект, который может быть null или undefined?",
  options: ["any", "unknown", "null", "void"],
  code: "let x: ___ = null;",
};

const taskReact1: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  question: "Какой хук используется для добавления побочного эффекта в функциональный компонент?",
  code: "import { ___ } from 'react';",
};

const mainSet: TrainingSet = {
  id: "set-1",
  title: "Основы веб-разработки",
  tasks: [taskTs1, taskReact1],
};

const emptySet: TrainingSet = {
  id: "set-empty",
  title: "Пустой набор",
  tasks: [],
};

const otherSet: TrainingSet = {
  id: "set-2",
  title: "Другой набор",
  tasks: [
    {
      id: "css-1",
      kind: "short-text",
      topic: "css",
      question: "Какое свойство меняет цвет текста?",
    },
  ],
};

const answersPartial: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "1" }, 
];

const answersFull: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "1" },
  { taskId: "react-1", kind: "short-text", text: "useEffect" }, 
];

const answersWithWhitespace: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "1" },
  { taskId: "react-1", kind: "short-text", text: "   " }, 
];

const answersWithUnknownTask: Answer[] = [
  { taskId: "unknown-id", kind: "short-text", text: "ответ" }, 
  { taskId: "ts-1", kind: "single-choice", optionId: "1" },
];



console.log("1. Поиск задания");
console.log("Найден ts-1:", findTaskById(mainSet.tasks, "ts-1")?.question);
console.log("Отсутствующий id:", findTaskById(mainSet.tasks, "missing-id"));

console.log("\n 2. Фильтрация");
console.log("Фильтр 'react':", filterTasksByTopic(mainSet.tasks, "react").length, "шт.");
console.log("Фильтр 'python' (нет совпадений):", filterTasksByTopic(mainSet.tasks, "python").length, "шт.");
console.log("Фильтр пустого набора:", filterTasksByTopic(emptySet.tasks, "ts").length, "шт.");

console.log("\n 3. Прогресс ");
console.log("Пустой набор:", calculateProgress(emptySet.tasks, []));
console.log("Частичный ответ:", calculateProgress(mainSet.tasks, answersPartial)); 
console.log("Полный ответ:", calculateProgress(mainSet.tasks, answersFull));
console.log("Пробельный текст (не считается):", calculateProgress(mainSet.tasks, answersWithWhitespace)); 
console.log("Чужой taskId (игнорируется):", calculateProgress(mainSet.tasks, answersWithUnknownTask)); 

console.log("\n 4. Проверка неизменности (чистота функций)");
const tasksBefore = structuredClone(mainSet.tasks);
const answersBefore = structuredClone(answersFull);

findTaskById(mainSet.tasks, "ts-1");
filterTasksByTopic(mainSet.tasks, "react");
calculateProgress(mainSet.tasks, answersFull);


const tasksUnchanged = JSON.stringify(mainSet.tasks) === JSON.stringify(tasksBefore);
const answersUnchanged = JSON.stringify(answersFull) === JSON.stringify(answersBefore);

console.log("Исходный массив заданий не изменен:", tasksUnchanged);
console.log("Исходный массив ответов не изменен:", answersUnchanged);