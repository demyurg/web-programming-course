import type { Answer, Progress, TrainingSet } from "./domain";
import { countProgress, filterTasks, findTask } from "./domain";
import { webBasics, cssBasics } from "./data";
import published from "../../course/data/training-set.json";

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
