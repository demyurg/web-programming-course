import type { TrainingSet, Answer, Task } from "./domain";
import { findTaskById, filterTasksByTopic, calculateProgress } from "./domain";

// --- 1. Типизированные литералы (взяты из контракта курса) ---
const taskTs1: Task = {
  id: "ts-1",
  kind: "single-choice",
  topic: "typescript",
  prompt: "Что выведет этот JavaScript-код?",
  code: "console.log(\"10\" * 5);",
  options: [
    { id: "a", label: "105" },
    { id: "b", label: "50" },
    { id: "c", label: "Ошибка" },
  ],
};

const taskReact1: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

const mainSet: TrainingSet = {
  id: "set-1",
  title: "Основной набор",
  tasks: [taskTs1, taskReact1],
};

const emptySet: TrainingSet = {
  id: "set-empty",
  title: "Пустой набор",
  tasks: [],
};

// --- 2. Массивы ответов для разных сценариев ---
const validAnswers: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  { taskId: "react-1", kind: "short-text", text: "Props неизменяемы, а state изменяем." },
  // Ответ с неизвестным taskId допустим по контракту, но не влияет на прогресс
  { taskId: "unknown-task-id", kind: "short-text", text: "Игнорируемый ответ" }, 
];

const whitespaceAnswer: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "a" },
  { taskId: "react-1", kind: "short-text", text: "   " }, // Только пробелы
];

// Сохраняем исходные размеры для доказательства отсутствия мутаций (изменений)
const originalTasksLength = mainSet.tasks.length;
const originalAnswersLength = validAnswers.length;

// --- 3. Сценарии проверки (вывод в консоль) ---
console.log("=== 1. Поиск задания ===");
console.log("Найден ts-1:", findTaskById(mainSet, "ts-1")?.id); // Ожидаем: "ts-1"
console.log("Поиск отсутствующего id:", findTaskById(mainSet, "missing-id")); // Ожидаем: undefined

console.log("\n=== 2. Фильтрация по теме ===");
console.log("Фильтр 'react':", filterTasksByTopic(mainSet, "react").map((t) => t.id)); // Ожидаем: ["react-1"]
console.log("Фильтр 'html' (нет совпадений):", filterTasksByTopic(mainSet, "html").map((t) => t.id)); // Ожидаем: []
console.log("Фильтр по пустой строке:", filterTasksByTopic(mainSet, "").map((t) => t.id)); // Ожидаем: ["ts-1", "react-1"]

console.log("\n=== 3. Подсчёт прогресса ===");
console.log("Полный набор с валидными ответами:", calculateProgress(mainSet, validAnswers)); // Ожидаем: { completed: 2, total: 2 }
console.log("Частичный набор (1 ответ):", calculateProgress(mainSet, [validAnswers[0]])); // Ожидаем: { completed: 1, total: 2 }
console.log("Пустой набор:", calculateProgress(emptySet, [])); // Ожидаем: { completed: 0, total: 0 }
console.log("Набор с пробельным текстовым ответом:", calculateProgress(mainSet, whitespaceAnswer)); // Ожидаем: { completed: 1, total: 2 }

console.log("\n=== 4. Проверка отсутствия мутаций (чистота функций) ===");
console.log("Длина tasks в mainSet не изменилась:", mainSet.tasks.length === originalTasksLength); // Ожидаем: true
console.log("Длина массива answers не изменилась:", validAnswers.length === originalAnswersLength); // Ожидаем: true