import type { TrainingSet, Task, Answer } from "./domain.js";
import { findTask, filterTasks, getProgress } from "./domain.js";

// Тестовые данные 
const taskTs1: Task = {
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
};

const taskReact1: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

const mainSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [taskTs1, taskReact1],
};

const secondSet: TrainingSet = {
  id: "http-basics",
  title: "Основы HTTP",
  tasks: [
    {
      id: "http-1",
      kind: "short-text",
      topic: "http",
      prompt: "Тестовое задание HTTP",
    },
  ],
};

const emptySet: TrainingSet = {
  id: "empty",
  title: "Пустой набор",
  tasks: [],
};

const answers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "Props неизменяемы, state изменяем" },
  { taskId: "unknown-id", kind: "short-text", text: "Чужой ответ" },
];

// Сценарии проверки 
console.log("=== findTask ===");
console.log("Найден ts-1:", findTask(mainSet, "ts-1")?.prompt);
console.log("Не найден ts-33:", findTask(mainSet, "ts-33")); 

console.log("\n=== filterTasks ===");
console.log("TS задания:", filterTasks(mainSet.tasks, "typescript").length);
console.log("Нет совпадений (python):", filterTasks(mainSet.tasks, "python").length);
console.log("Пустой фильтр:", filterTasks([], "test").length);
console.log("HTTP во втором наборе:", filterTasks(secondSet.tasks, "http").length);

console.log("\n=== getProgress ===");
console.log("Пустой набор:", getProgress(emptySet, []));
console.log("Без ответов:", getProgress(mainSet, []));
console.log("С ответами:", getProgress(mainSet, answers));
console.log("Чужой ID:", getProgress(mainSet, [{ taskId: "fake", kind: "short-text", text: "x" }]));
console.log("Пробелы в тексте:", getProgress(mainSet, [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "   " },
]));

console.log("\n=== Проверка отсутствия мутаций ===");
const tasksBefore = JSON.stringify(mainSet.tasks);
const ansBefore = JSON.stringify(answers);

findTask(mainSet, "ts-1");
filterTasks(mainSet.tasks, "typescript");
getProgress(mainSet, answers);

console.log("Задачи не изменились:", tasksBefore === JSON.stringify(mainSet.tasks));
console.log("Ответы не изменились:", ansBefore === JSON.stringify(answers));