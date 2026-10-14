// тестовые данные и проверка работоспособности функций( не ломают исходные данные)
import type { TrainingSet, Answer } from "./domain";
import { findTaskById, filterTasksByTopic, calculateProgress } from "./domain";

// тестовые данные

const mainSet: TrainingSet = {
  id: "set-1",
  title: "Основы TypeScript и React",
  tasks: [
    {
      id: "ts-1",
      kind: "single-choice",
      topic: "TypeScript",
      text: "Какой тип описывает значение, которое может быть строкой или числом?",
      options: ["string | number", "string & number", "any"],
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "React",
      text: "Напишите название хука для хранения состояния.",
    },
  ],
};

const secondSet: TrainingSet = {
  id: "set-2",
  title: "CSS и вёрстка",
  tasks: [
    {
      id: "css-1",
      kind: "single-choice",
      topic: "CSS",
      text: "Какое свойство меняет цвет текста?",
      options: ["color", "background"],
    },
  ],
};

const emptySet: TrainingSet = {
  id: "set-empty",
  title: "Пустой набор",
  tasks: [],
};

// массив ответов пользователя
const userAnswers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "string | number" }, // валидный ответ
  { taskId: "react-1", kind: "short-text", text: "   " },                // только пробелы
  { taskId: "unknown-999", kind: "short-text", text: "Лишний ответ" },   // ответ на несуществующее задание
];

// проверка

console.log(" ПОИСК (findTaskById)");
console.log("Найден ts-1:", findTaskById(mainSet, "ts-1")?.id); // должен вывести ts-1
console.log("Несуществующий id:", findTaskById(mainSet, "missing")); // должен вывести undefined

console.log("\n ФИЛЬТР (filterTasksByTopic)");
console.log("Фильтр 'TypeScript':", filterTasksByTopic(mainSet, "TypeScript").length, "шт."); // 1
console.log("Фильтр 'JavaScript' (нет совпадений):", filterTasksByTopic(mainSet, "JavaScript").length, "шт."); // 0
console.log("Фильтр в пустом наборе:", filterTasksByTopic(emptySet, "CSS").length, "шт."); // 0

console.log("\n ПРОГРЕСС (calculateProgress)");
// ожидаетсяfilled: 1, total: 2
console.log("Прогресс основного набора:", calculateProgress(mainSet, userAnswers)); 
// ожидается filled: 0, total: 0
console.log("Прогресс пустого набора:", calculateProgress(emptySet, [])); 

console.log("\n ПРОВЕРКА ЧИСТОТЫ (Данные не изменились)");
console.log("Длина исходного mainSet.tasks:", mainSet.tasks.length); // должно быть 2
console.log("Длина исходного userAnswers:", userAnswers.length); // олжно быть 3