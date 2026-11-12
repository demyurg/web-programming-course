import type { TrainingSet, Task, Answer } from "./domain";
import { findTask, filterTasks, getProgress } from "./domain";

const task1: Task = {
    id: "ts-1",
    kind: "single-choice",
    topic: "typescript",
    prompt: "Что выведет этот JavaScript-код?",
    code: 'console.log("10" * 5);',
    options: [{ id: "a", label: "105" },
              { id: "b", label: "50" },
              { id: "c", label: "Ошибка" },],
};

const task2: Task = {
    id: "react-1",
    kind: "short-text",
    topic: "react",
    prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

const mainSet: TrainingSet = {
    id: "web-basics",
    title: "Основы веб-программирования",
    tasks: [task1, task2],
};

const task3: Task = {
    id: "http-1",
    kind: "short-text",
    topic: "http",
    prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
};

const task4: Task = {
    id: "http-2",
    kind: "single-choice",
    topic: "http",
    prompt: "Какой код ответа означает «не найдено»?",
    options: [{ id: "a", label: "200" },
              { id: "b", label: "404" },
              { id: "c", label: "500" },],
};

const secondSet: TrainingSet = {
    id: "http-basics",
    title: "Основы HTTP",
    tasks: [task3, task4],
};

const emptySet: TrainingSet = {
    id: "empty",
    title: "Пустой набор",
    tasks: [],
};

const answer1: Answer = {
    taskId: "ts-1",
    kind: "single-choice",
    optionId: "b",
};

const answer2: Answer = {
    taskId: "react-1",
    kind: "short-text",
    text: "Props передаются снаружи и только для чтения, а state создаётся внутри компонента и может меняться.",
};

const answer3: Answer = {
    taskId: "unknown",
    kind: "short-text",
    text: "Этот ответ ни к какому заданию не привязан.",
};

const answers: Answer[] = [answer1, answer2, answer3];

// Сценарии findTask
console.log("Сценарии findTask: ");
console.log("Найден ts-1:", findTask(mainSet, "ts-1"));
console.log("Не найден ts-33:", findTask(mainSet, "ts-33"));
console.log();

// Сценарии filterTasks
console.log("Сценарии filterTasks: ");
console.log("Фильтр по `typescript`: ", filterTasks(mainSet.tasks, "typescript"));
console.log("Фильтр по `css`: ", filterTasks(mainSet.tasks, "css"));
console.log("Фильтр по пустой строке: ", filterTasks(mainSet.tasks, ""));
console.log("Фильтр по `typescript` в пустом массиве: ", filterTasks([], "typescript"));
console.log("Фильтр по `http` во втором наборе: ", filterTasks(secondSet.tasks, "http"));
console.log();

// Сценарии getProgress
console.log("Сценарии getProgress: ");
console.log("Пустой набор: ", getProgress(emptySet, []));
console.log("Заполненный набор без ответов: ", getProgress(mainSet, []));
console.log("Заполненный набор с ответами: ", getProgress(mainSet, answers));
console.log(
    "Заполненный набор с одним ответом: ",
    getProgress(mainSet, [{ taskId: "ts-1", kind: "single-choice", optionId: "b" }])
);
console.log(
    "Заполненный набор с ответом на несуществующий вопрос: ",
    getProgress(mainSet, [{ taskId: "unknown", kind: "short-text", text: "чужой" }])
);
console.log(
    "Заполненный набор с ответом из пробелов: ",
    getProgress(mainSet, [
        { taskId: "ts-1", kind: "single-choice", optionId: "b" },
        { taskId: "react-1", kind: "short-text", text: "   " },
    ])
);
console.log(
    "Заполненный набор с несуществующим вариантом ответа: ",
    getProgress(mainSet, [{ taskId: "ts-1", kind: "single-choice", optionId: "z" }])
);
console.log();

console.log("Проверка неизменности входов: ");

// JSON.stringify превращает объект в строку, обходя все вложенные поля. 
const tasksBefore = JSON.stringify(mainSet.tasks);
const answersBefore = JSON.stringify(answers);

findTask(mainSet, "ts-1");
filterTasks(mainSet.tasks, "typescript");
getProgress(mainSet, answers);

const tasksAfter = JSON.stringify(mainSet.tasks);
const answersAfter = JSON.stringify(answers);

console.log("Задания не изменились: ", tasksBefore === tasksAfter);
console.log("Ответы не изменились: ", answersBefore === answersAfter);