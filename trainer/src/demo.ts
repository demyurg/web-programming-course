import type { TrainingSet, Task, Answer } from "./domain";
import { findTask, filterTasks, getProgress } from "./domain";

// ===== Типизированные литералы из JSON =====

// ts-1 из набора web-basics
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

// react-1 из набора web-basics
const task2: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

// ===== Первый набор =====

const mainSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [task1, task2],
};

// ===== Второй набор с другими id и темой =====

const secondSet: TrainingSet = {
  id: "sql-basics",
  title: "Основы SQL",
  tasks: [
    {
      id: "sql-1",
      kind: "single-choice",
      topic: "sql",
      prompt: "Какая команда выбирает данные из таблицы?",
      options: [
        { id: "a", label: "SELECT" },
        { id: "b", label: "INSERT" },
        { id: "c", label: "DROP" },
      ],
    },
    {
      id: "sql-2",
      kind: "short-text",
      topic: "sql",
      prompt: "Чем WHERE отличается от HAVING?",
    },
  ],
};

// ===== Пустой набор =====

const emptySet: TrainingSet = {
  id: "empty",
  title: "Пустой набор",
  tasks: [],
};

// ===== Массив ответов. Один ответ с чужим id. =====

const answers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "Props приходят снаружи." },
  { taskId: "unknown", kind: "short-text", text: "Чужой ответ" },
];

// ===== 1. Поиск задания по id =====

console.log("1. Поиск задания по id");
console.log("ts-1:", findTask(mainSet, "ts-1"));
console.log("ts-99:", findTask(mainSet, "ts-99"));

// ===== 2. Фильтр заданий по теме =====

console.log("\n2. Фильтр заданий по теме");
console.log("typescript:", filterTasks(mainSet.tasks, "typescript"));
console.log("TypeScript (регистр):", filterTasks(mainSet.tasks, "TypeScript"));
console.log("react:", filterTasks(mainSet.tasks, "react"));
console.log("sql:", filterTasks(secondSet.tasks, "sql"));
console.log("пустая строка:", filterTasks(mainSet.tasks, ""));
console.log("нет совпадений:", filterTasks(mainSet.tasks, "zzz"));
console.log("пустой массив:", filterTasks([], "typescript"));

// ===== 3. Подсчёт прогресса =====

console.log("\n3. Подсчёт прогресса");
console.log("пустой набор:", getProgress(emptySet, []));
console.log("без ответов:", getProgress(mainSet, []));
console.log("полный набор:", getProgress(mainSet, answers));
console.log("второй набор без ответов:", getProgress(secondSet, []));

const firstAnswer = answers[0];
console.log(
  "один ответ:",
  firstAnswer ? getProgress(mainSet, [firstAnswer]) : "нет ответа"
);

console.log(
  "только чужой taskId:",
  getProgress(mainSet, [
    { taskId: "unknown", kind: "short-text", text: "чужой" },
  ])
);

console.log(
  "пробельный short-text:",
  getProgress(mainSet, [
    { taskId: "ts-1", kind: "single-choice", optionId: "a" },
    { taskId: "react-1", kind: "short-text", text: "   " },
  ])
);

console.log(
  "несуществующий optionId:",
  getProgress(mainSet, [
    { taskId: "ts-1", kind: "single-choice", optionId: "z" },
  ])
);

// ===== 4. Проверка неизменности входов =====

console.log("\n4. Проверка неизменности данных");

const beforeTasks = JSON.stringify(mainSet.tasks);
const beforeAnswers = JSON.stringify(answers);

findTask(mainSet, "ts-1");
filterTasks(mainSet.tasks, "typescript");
getProgress(mainSet, answers);

const afterTasks = JSON.stringify(mainSet.tasks);
const afterAnswers = JSON.stringify(answers);

console.log("Задания не изменились:", beforeTasks === afterTasks);
console.log("Ответы не изменились:", beforeAnswers === afterAnswers);