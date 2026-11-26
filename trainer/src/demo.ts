import {
  countProgress,
  filterTasksByTopic,
  findTaskById,
  type Answer,
  type TrainingSet,
} from "./domain";

const webBasicsSet: TrainingSet = {
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

const extraSet: TrainingSet = {
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
  id: "empty-set",
  title: "Пустой набор",
  tasks: [],
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
    text: "Props приходят снаружи, состояние живёт внутри компонента.",
  },
];

const oneAnswer: Answer[] = [
  {
    taskId: "ts-1",
    kind: "single-choice",
    optionId: "b",
  },
];

const whitespaceAnswer: Answer[] = [
  {
    taskId: "react-1",
    kind: "short-text",
    text: "   ",
  },
];

const foreignAnswer: Answer[] = [
  {
    taskId: "other-task",
    kind: "short-text",
    text: "Этот ответ относится к другому заданию.",
  },
];

const setBefore = JSON.stringify(webBasicsSet);
const answersBefore = JSON.stringify(answers);

console.log("Поиск существующего id ts-1:", findTaskById(webBasicsSet, "ts-1"));
console.log(
  "Поиск отсутствующего id missing-id:",
  findTaskById(webBasicsSet, "missing-id")
);

console.log(
  "Фильтр по topic typescript:",
  filterTasksByTopic(webBasicsSet, "typescript")
);
console.log(
  "Фильтр по topic css (нет совпадений):",
  filterTasksByTopic(webBasicsSet, "css")
);
console.log(
  "Фильтр по пустому набору:",
  filterTasksByTopic(emptySet, "typescript")
);

console.log("Прогресс: нет ответов", countProgress(webBasicsSet, []));
console.log("Прогресс: один ответ", countProgress(webBasicsSet, oneAnswer));
console.log("Прогресс: полный набор", countProgress(webBasicsSet, answers));
console.log("Прогресс: пустой набор", countProgress(emptySet, []));
console.log(
  "Прогресс: чужой taskId",
  countProgress(webBasicsSet, foreignAnswer)
);
console.log(
  "Прогресс: short-text из пробелов",
  countProgress(webBasicsSet, whitespaceAnswer)
);
console.log("Второй набор:", extraSet);

const setAfter = JSON.stringify(webBasicsSet);
const answersAfter = JSON.stringify(answers);

console.log("Набор не изменился:", setBefore === setAfter);
console.log("Массив ответов не изменился:", answersBefore === answersAfter);
