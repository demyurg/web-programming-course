
import type { TrainingSet, Answer} from "./domain";
import { findTaskById, filterTasksByTopic, countProgress } from "./domain";

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
  { taskId: "http-1", kind: "short-text", text: "   " }, // пробелы → не заполнен
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