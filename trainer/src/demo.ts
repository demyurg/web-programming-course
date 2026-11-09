import type { TrainingSet, Task, Answer } from "./domain";
import { findTask, filterTasks, getProgress } from "./domain";

// Задание ts-1
const task1: Task = {
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

// Задание react-1 
const task2: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

// Основной набор
const mainSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [task1, task2],
};

// Второй набор с другими id и темой
const secondSet: TrainingSet = {
  id: "python-basics",
  title: "Основы Python",
  tasks: [
    {
      id: "py-1",
      kind: "single-choice",
      topic: "python",
      prompt: "Какой тип у числа 42?",
      options: [
        { id: "a", label: "int" },
        { id: "b", label: "str" },
        { id: "c", label: "float" },
      ],
    },
    {
      id: "py-2",
      kind: "short-text",
      topic: "python",
      prompt: "Что такое список в Python?",
    },
  ],
};

// Пустой набор
const emptySet: TrainingSet = {
  id: "empty",
  title: "Пустой набор",
  tasks: [],
};

// Массив ответов. Один ответ с чужим id.
const answers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "Props приходят снаружи." },
  { taskId: "unknown", kind: "short-text", text: "Чужой ответ" },
];

// 1. Поиск задания по id

console.log("1. Поиск задания по id");

console.log("Поиск задания с id = ts-1");
console.log(findTask(mainSet, "ts-1"));

console.log("Поиск задания с id = ts-99");
console.log(findTask(mainSet, "ts-99"));

// 2. Фильтр заданий по теме

console.log("\n2. Фильтр заданий по теме");

console.log("Фильтр по теме typescript");
console.log(filterTasks(mainSet.tasks, "typescript"));

console.log("Фильтр по теме react");
console.log(filterTasks(mainSet.tasks, "react"));

console.log("Фильтр по теме python");
console.log(filterTasks(mainSet.tasks, "python"));

console.log("Фильтр по пустому массиву заданий");
console.log(filterTasks([], "typescript"));

// 3. Подсчёт прогресса

console.log("\n3. Подсчёт прогресса");

console.log("Пустой набор, ответов нет");
console.log(getProgress(emptySet, []));

console.log("Один ответ из двух заданий");
console.log(getProgress(mainSet, [answers[0]]));

console.log("Полный набор ответов");
console.log(getProgress(mainSet, answers));

console.log("Только ответ с чужим taskId");
console.log(
  getProgress(mainSet, [
    { taskId: "unknown", kind: "short-text", text: "чужой" },
  ])
);

console.log("Short-text только из пробелов");
console.log(
  getProgress(mainSet, [
    { taskId: "ts-1", kind: "single-choice", optionId: "a" },
    { taskId: "react-1", kind: "short-text", text: "   " },
  ])
);

// 4. Проверка, что функции не изменили исходные данные

console.log("\n4. Проверка неизменности данных");

const beforeTasks = JSON.stringify(mainSet.tasks);
const beforeAnswers = JSON.stringify(answers);

findTask(mainSet, "ts-1");
filterTasks(mainSet.tasks, "typescript");
getProgress(mainSet, answers);

const afterTasks = JSON.stringify(mainSet.tasks);
const afterAnswers = JSON.stringify(answers);

console.log("Задания не изменились после вызовов функций:", beforeTasks === afterTasks);
console.log("Ответы не изменились после вызовов функций:", beforeAnswers === afterAnswers);