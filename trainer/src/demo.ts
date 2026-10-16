import type { Answer, Progress, TrainingSet } from "./domain";
import { countProgress, filterTasks, findTask } from "./domain";
import published from "../../course/data/training-set.json";

const webBasics: TrainingSet = {
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

const cssBasics: TrainingSet = {
  id: "css-basics",
  title: "Основы CSS",
  tasks: [
    {
      id: "css-1",
      kind: "single-choice",
      topic: "css",
      prompt: "Какое свойство задаёт внешние отступы?",
      options: [
        { id: "a", label: "padding" },
        { id: "b", label: "margin" },
        { id: "c", label: "border" },
      ],
    },
    {
      id: "css-2",
      kind: "short-text",
      topic: "css",
      prompt: "Когда уместно использовать flex, а когда grid?",
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
  { taskId: "react-1", kind: "short-text", text: "Моё объяснение" },
];

const noAnswers: Answer[] = [];

const oneAnswer: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
];

const whitespaceAnswer: Answer[] = [
  { taskId: "react-1", kind: "short-text", text: "   " },
];

const foreignAnswer: Answer[] = [
  { taskId: "http-1", kind: "short-text", text: "Проверить response.ok" },
];

function show(label: string, value: unknown): void {
  if (value === undefined) {
    console.log(label, "undefined");
    return;
  }

  console.log(label, JSON.stringify(value, null, 2));
}

function showProgress(label: string, progress: Progress): void {
  console.log(`${label}: filled=${progress.filled}, total=${progress.total}`);
}

const setBefore = JSON.stringify(webBasics);
const answersBefore = JSON.stringify(answers);

console.log("Опубликованный JSON (просмотр формы):");
console.log(JSON.stringify(published, null, 2));

show("Поиск ts-1", findTask(webBasics, "ts-1"));
show("Поиск отсутствующего id", findTask(webBasics, "missing"));
show("Фильтр typescript", filterTasks(webBasics, "typescript"));
show("Фильтр без совпадений", filterTasks(webBasics, "http"));
show("Фильтр пустого набора", filterTasks(emptySet, "css"));
showProgress("Прогресс пустого набора", countProgress(emptySet, noAnswers));
showProgress("Прогресс без ответов", countProgress(webBasics, noAnswers));
showProgress("Прогресс одного ответа", countProgress(webBasics, oneAnswer));
showProgress("Прогресс полного набора", countProgress(webBasics, answers));

const whitespace = "   ";
show("Пробельный текст", {
  original: whitespace,
  length: whitespace.length,
  trimmed: whitespace.trim(),
  trimmedLength: whitespace.trim().length,
  filled: whitespace.trim() !== "",
});
showProgress("Прогресс при пробельном тексте", countProgress(webBasics, whitespaceAnswer));
showProgress("Прогресс при чужом taskId", countProgress(webBasics, foreignAnswer));
show("Второй набор, фильтр css", filterTasks(cssBasics, "css"));
show("Второй набор, поиск css-2", findTask(cssBasics, "css-2"));

findTask(webBasics, "ts-1");
filterTasks(webBasics, "typescript");

show("Набор не изменился", JSON.stringify(webBasics) === setBefore);
show("Ответы не изменились", JSON.stringify(answers) === answersBefore);
