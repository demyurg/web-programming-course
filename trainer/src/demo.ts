import type { TrainingSet, Answer } from "./domain";
import {
  findTaskById,
  filterTasksByTopic,
  calculateProgress,
} from "./domain";

const sampleSet1: TrainingSet = {
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
    {
      id: "html-1",
      kind: "short-text",
      topic: "html",
      prompt: "Зачем нужен <form> в HTML?",
    },
  ],
};

const sampleSet2: TrainingSet = {
  id: "set-empty-theme",
  title: "Другая тема",
  tasks: [],
};

const userAnswers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: " " },
  { taskId: "html-1", kind: "short-text", text: "Ответ" },
];

console.log("ДЕМО");

console.log("\nПоиск по ID");
const foundTask = findTaskById(sampleSet1.tasks, "ts-1");
const missingTask = findTaskById(sampleSet1.tasks, "ts-2");

console.log(
  `  ts-1: ${foundTask ? `найден — "${foundTask.prompt}"` : "не найден"}`
);
console.log(`  ts-2: ${missingTask ? "найден" : "не найден"}`);

console.log("\nФильтрация по теме");
const tsCount = filterTasksByTopic(sampleSet1.tasks, "typescript").length;
const reactCount = filterTasksByTopic(sampleSet1.tasks, "react").length;
const vueCount = filterTasksByTopic(sampleSet1.tasks, "vue").length;

console.log(`  typescript: ${tsCount}`);
console.log(`  react: ${reactCount}`);
console.log(`  vue: ${vueCount}`);

console.log("\nПрогресс");
const mainProgress = calculateProgress(sampleSet1, userAnswers);
const emptyProgress = calculateProgress(sampleSet2, userAnswers);

console.log(`  web-basics: ${mainProgress.filled} из ${mainProgress.total}`);
console.log(`  пустой набор: ${emptyProgress.filled} из ${emptyProgress.total}`);

console.log("\nЧистота функций");
console.log(
  `  задачи не изменились: ${sampleSet1.tasks.length === 2 ? "да" : "нет"}`);
console.log(
  `  ответы не изменились: ${userAnswers.length === 3 ? "да" : "нет"}`);