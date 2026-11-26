import {
  countProgress,
  findTask,
  tasksByTopic,
  type Answer,
  type TrainingSet,
} from "./domain";

const webSet: TrainingSet = {
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

const a11ySet: TrainingSet = {
  id: "http-basics",
  title: "Основы HTTP",
  tasks: [
    {
      id: "http-extra-1",
      kind: "short-text",
      topic: "http",
      prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
    },
  ],
};

const emptySet: TrainingSet = {
  id: "empty-basics",
  title: "Пустой набор",
  tasks: [],
};

const noAnswers: Answer[] = [];
const oneAnswer: Answer[] = [{ taskId: "ts-1", kind: "single-choice", optionId: "b" }];
const fullAnswers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "props приходят снаружи, state живёт внутри" },
];
const otherAnswer: Answer[] = [
  { taskId: "node-1", kind: "short-text", text: "Задания node-1 нет в наборе" },
];
const blankTextAnswer: Answer[] = [{ taskId: "react-1", kind: "short-text", text: "   " }];

const sets: TrainingSet[] = [webSet, a11ySet, emptySet];
const allAnswers: Answer[][] = [noAnswers, oneAnswer, fullAnswers, otherAnswer, blankTextAnswer];

const reviewSet: TrainingSet = { ...webSet, tasks: webSet.tasks.slice().reverse() };

const setsBefore = JSON.stringify(sets);
const answersBefore = JSON.stringify(allAnswers);

console.log("Раздел поиска по ID");
console.log("Поиск существующего id ts-1:", findTask(webSet, "ts-1"));
console.log("Поиск существующего id react-1:", findTask(webSet, "react-1"));
console.log("Поиск отсутствующего id missing-id:", findTask(webSet, "missing-id"));
console.log("Поиск в пустом наборе:", findTask(emptySet, "ts-1"));

console.log("\nРаздел поиска по разделам");
console.log("Фильтр по topic typescript:", tasksByTopic(webSet, "typescript"));
console.log("Фильтр по topic react:", tasksByTopic(webSet, "react"));
console.log("Фильтр по topic accessibility (нет совпадений):", tasksByTopic(webSet, "accessibility"));
console.log("Фильтр по пустой строке:", tasksByTopic(webSet, "   "));
console.log("Фильтр по пустому набору:", tasksByTopic(emptySet, "react"));

console.log("\nРаздел прогрессов ответов");
console.log("Прогресс: нет ответов", countProgress(webSet, noAnswers));
console.log("Прогресс: один ответ", countProgress(webSet, oneAnswer));
console.log("Прогресс: полный набор", countProgress(webSet, fullAnswers));
console.log("Прогресс: пустой набор", countProgress(emptySet, fullAnswers));
console.log("Прогресс: чужой taskId", countProgress(webSet, otherAnswer));
console.log("Прогресс: short-text из пробелов", countProgress(webSet, blankTextAnswer));
console.log("Прогресс: набор с обратным порядком заданий", countProgress(reviewSet, fullAnswers));

console.log("\nВторой набор:", a11ySet);

console.log("Набор не изменился:", setsBefore === JSON.stringify(sets));
console.log("Массив ответов не изменился:", answersBefore === JSON.stringify(allAnswers));
console.log("findTask вернул исходный объект:", findTask(webSet, "ts-1") === webSet.tasks[0]);
console.log("tasksByTopic вернул новый массив:", tasksByTopic(webSet, "typescript") !== webSet.tasks);