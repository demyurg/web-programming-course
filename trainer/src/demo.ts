import { countProgress, findTaskById, filterTasksByTopic } from "./domain";
import { attemptReducer, buildReview } from "./domain";
import type { Answer, Attempt, TrainingSet } from "./domain";

const set1: TrainingSet = {
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
  id: "http-basics",
  title: "Основы HTTP",
  tasks: [
    {
      id: "http-1",
      kind: "short-text",
      topic: "http",
      prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
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
  { taskId: "react-1", kind: "short-text", text: "Props — входные данные, state — внутреннее состояние." },
  { taskId: "unknown-1", kind: "short-text", text: "Чужой ответ" },
  { taskId: "http-1", kind: "short-text", text: "   " },
];

const beforeTasks = JSON.stringify(set1.tasks);
const beforeAnswers = JSON.stringify(answers);

console.log("Поиск ts-1:", findTaskById(set1.tasks, "ts-1"));
console.log("Поиск отсутствующего:", findTaskById(set1.tasks, "nope"));
console.log("Фильтр typescript:", filterTasksByTopic(set1.tasks, "typescript"));
console.log("Фильтр без совпадений:", filterTasksByTopic(set1.tasks, "python"));
console.log("Фильтр пустого набора:", filterTasksByTopic(emptySet.tasks, "typescript"));
console.log("Прогресс пустого:", countProgress(emptySet, []));
console.log("Прогресс set1 + answers:", countProgress(set1, answers));
console.log("Прогресс set2 + answers:", countProgress(set2, answers));
console.log("Набор не изменился:", JSON.stringify(set1.tasks) === beforeTasks);
console.log("Ответы не изменились:", JSON.stringify(answers) === beforeAnswers);

// ===== A4: правило попытки проверяется без React =====

const start: Attempt = {
  setId: set1.id,
  taskId: "ts-1",
  answers: [],
  status: "in-progress",
};

const afterSet = attemptReducer(start, {
  type: "answerChanged",
  answer: { taskId: "ts-1", kind: "single-choice", optionId: "b" },
});
console.log("answerChanged adds:", afterSet.answers.length === 1);
console.log("reducer immut:", start.answers.length === 0);

const afterMove = attemptReducer(afterSet, { type: "moved", taskId: "react-1" });
console.log("moved:", afterMove.taskId === "react-1");

const afterClear = attemptReducer(afterMove, { type: "answerCleared", taskId: "ts-1" });
console.log("answerCleared removes:", afterClear.answers.length === 0);

const submitted = attemptReducer(afterSet, { type: "submitted" });
console.log("submitted:", submitted.status === "submitted");

const afterEdit = attemptReducer(submitted, {
  type: "answerChanged",
  answer: { taskId: "ts-1", kind: "single-choice", optionId: "a" },
});
console.log("submitted rejects edit:", afterEdit === submitted);

const afterClearSubmitted = attemptReducer(submitted, {
  type: "answerCleared",
  taskId: "ts-1",
});
console.log("submitted rejects clear:", afterClearSubmitted === submitted);

// ===== A4: обзор показывает все задания попытки =====

const review = buildReview(set1, afterSet.answers);
console.log("review rows:", review.length === set1.tasks.length);
console.log("review ts-1:", review.find((r) => r.taskId === "ts-1")?.value);
console.log(
  "review react-1 пусто:",
  review.find((r) => r.taskId === "react-1")?.value === "",
);

// Обзор читает те же данные: очистка из любого места отражается в обзоре.
const reviewAfterClear = buildReview(set1, afterClear.answers);
console.log(
  "review после очистки ts-1 пусто:",
  reviewAfterClear.find((r) => r.taskId === "ts-1")?.value === "",
);