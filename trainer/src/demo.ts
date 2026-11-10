import type { Answer, Task, TrainingSet } from "./domain";
import { findTaskById, filterTasksByTopic, calculateProgress } from "./domain";

export const mainSet: TrainingSet = {
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

const set2: TrainingSet = {
  id: "html-basic",
  title: "Основы HTML",
  tasks: [
    { id: "html-1", kind: "short-text", topic: "html", prompt: "Какой тег для шапки" },
    { id: "html-2", kind: "short-text", topic: "html", prompt: "Какой тег для изображения" },
  ],
};

const set3: TrainingSet = {
  id: "css-basic",
  title: "Основы CSS",
  tasks: [],
};

const answers1: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "a" },
  { taskId: "react-1", kind: "short-text", text: "props передаются извне" },
];

const answersBlank: Answer[] = [
  { taskId: "react-1", kind: "short-text", text: "   " },
];

console.log("======== Поиск задания по Id ========");
console.log("ts-1", findTaskById(mainSet.tasks, "ts-1")?.prompt);
console.log("несуществующий", findTaskById(mainSet.tasks, "ts-11111111"));

console.log("======== Фильтрация заданий ========");
console.log("typescript", filterTasksByTopic(mainSet.tasks, "typescript"));
console.log("пустой набор", filterTasksByTopic(set3.tasks, "kotlin"));

console.log("======== Прогресс ========");
console.log("обычный:", calculateProgress(mainSet.tasks, answers1));
console.log("с пробелами:", calculateProgress(mainSet.tasks, answersBlank));
console.log("пустой набор:", calculateProgress(set3.tasks, answers1));