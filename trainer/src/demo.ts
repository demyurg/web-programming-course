import type { TrainingSet, Task, Answer } from "./domain";
import { findTask, filterTasks, getProgress } from "./domain";

// ===== Основной набор =====

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

// ===== Второй набор с другими id и темой =====

const secondSet: TrainingSet = {
  id: "1c-basics",
  title: "Основы 1С",
  tasks: [
    {
      id: "1c-1",
      kind: "single-choice",
      topic: "1с",
      prompt: "Что используется для хранения данных в 1С?",
      options: [
        { id: "a", label: "Справочник" },
        { id: "b", label: "CSS-файл" },
        { id: "c", label: "HTML-страница" },
      ],
    },
    {
      id: "1c-2",
      kind: "short-text",
      topic: "1с",
      prompt: "Для чего используется язык запросов 1С?",
    },
  ],
};

// ===== Пустой набор =====

const emptySet: TrainingSet = {
  id: "empty",
  title: "Пустой набор",
  tasks: [],
};

// ===== Ответы =====

const answers: Answer[] = [
  // Ответы для основного набора
  {
    taskId: "ts-1",
    kind: "single-choice",
    optionId: "b",
  },
  {
    taskId: "ts-2",
    kind: "single-choice",
    optionId: "a",
  },
  {
    taskId: "react-1",
    kind: "short-text",
    text: "Props приходят снаружи, а состояние хранится внутри компонента.",
  },
  {
    taskId: "http-1",
    kind: "short-text",
    text: "Нужно проверить статус HTTP-ответа перед использованием JSON.",
  },

  // Ответ для второго набора
  {
    taskId: "1c-1",
    kind: "single-choice",
    optionId: "a",
  },
  {
    taskId: "1c-2",
    kind: "short-text",
    text: "Для быстрого чтения, отбора, группировки и обработки данных, хранящихся в базе данных системы «1С:Предприятие».",
  },

  // Чужой ответ — для проверки
  {
    taskId: "unknown",
    kind: "short-text",
    text: "Чужой ответ",
  },
];

// ===== 1. Поиск =====

console.log("1. Поиск задания");
console.log("ts-1:", findTask(mainSet, "ts-1"));
console.log("ts-2:", findTask(mainSet, "ts-2"));
console.log("ts-3:", findTask(mainSet, "ts-3"));

// ===== 2. Фильтрация =====

console.log("\n2. Фильтрация по теме");
console.log("typescript:", filterTasks(mainSet.tasks, "typescript"));
console.log("react:", filterTasks(mainSet.tasks, "react"));
console.log("1С:", filterTasks(secondSet.tasks, "1с"));
console.log("нет совпадений:", filterTasks(mainSet.tasks, "1с"));
console.log("пустой массив:", filterTasks([], "typescript"));

// ===== 3. Прогресс =====

console.log("\n3. Прогресс");
console.log("пустой набор:", getProgress(emptySet, []));
console.log("без ответов:", getProgress(mainSet, []));
console.log("один ответ:", getProgress(mainSet, [answers[0], answers[1]]));
console.log("все ответы:", getProgress(mainSet, answers));
console.log("чужой taskId:", getProgress(mainSet, [
  { taskId: "unknown", kind: "short-text", text: "чужой" },
]));
console.log("пробельный ответ:", getProgress(mainSet, [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "   " },
]));
console.log("второй набор:", getProgress(secondSet, []));

// ===== 4. Неизменность входов =====

console.log("\n4. Неизменность данных");

const beforeTasks = JSON.stringify(mainSet.tasks);
const beforeAnswers = JSON.stringify(answers);

findTask(mainSet, "ts-1");
filterTasks(mainSet.tasks, "typescript");
getProgress(mainSet, answers);

const afterTasks = JSON.stringify(mainSet.tasks);
const afterAnswers = JSON.stringify(answers);

console.log("Задания не изменились:", beforeTasks === afterTasks);
console.log("Ответы не изменились:", beforeAnswers === afterAnswers);