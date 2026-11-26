import {
  type Answer,
  type TrainingSet,
  countProgress,
  filterByTopic,
  findTask,
} from "./domain";

const set: TrainingSet = {
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

const otherSet: TrainingSet = {
  id: "git-basics",
  title: "Основы Git",
  tasks: [
    {
      id: "git-1",
      kind: "single-choice",
      topic: "git",
      prompt: "Для чего нужна ветка?",
      options: [
        { id: "a", label: "Для отдельной линии работы" },
        { id: "b", label: "Только для удаления файлов" },
      ],
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
  { taskId: "react-1", kind: "short-text", text: "Props приходят снаружи" },
];

const oneAnswer: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
];

const spacesAnswer: Answer[] = [
  { taskId: "react-1", kind: "short-text", text: "   " },
];

const foreignAnswer: Answer[] = [
  { taskId: "http-1", kind: "short-text", text: "Проверить response.ok" },
];

const setBefore = JSON.stringify(set);
const answersBefore = JSON.stringify(answers);

console.log("найти ts-1:", findTask(set, "ts-1"));
console.log("найти отсутствующий id:", findTask(set, "no-such-id"));

console.log("фильтр typescript:", filterByTopic(set, "typescript"));
console.log("фильтр без совпадений:", filterByTopic(set, "http"));
console.log("фильтр пустой набор:", filterByTopic(emptySet, "typescript"));
console.log("фильтр пустой topic:", filterByTopic(set, ""));

console.log("прогресс один ответ:", countProgress(set, oneAnswer));
console.log("прогресс полный набор:", countProgress(set, answers));
console.log("прогресс пустой набор:", countProgress(emptySet, []));
console.log("прогресс пробелы:", countProgress(set, spacesAnswer));
console.log("прогресс чужой taskId:", countProgress(set, foreignAnswer));
console.log("прогресс другой набор:", countProgress(otherSet, []));

console.log("набор не изменился:", JSON.stringify(set) === setBefore);
console.log("ответы не изменились:", JSON.stringify(answers) === answersBefore);
