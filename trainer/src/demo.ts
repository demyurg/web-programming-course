/*const message: string = "TypeScript запускается";
console.log(message);*/
import type { Answer, TrainingSet} from "./domain.js";
import { findTask, filterTasksByTopic, getProgress} from "./domain.js";
const trainingSet: TrainingSet = {
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
        {
          id: "a",
          label: "105"
        },
        {
          id: "b",
          label: "50"
        },
        {
          id: "c",
          label: "Ошибка"
        }
      ]
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "react",
      prompt: "Объясните, чем props компонента отличаются от его состояния."
    }
  ]
};
const answers: Answer[] = [
  {
    taskId: "ts-1",
    kind: "single-choice",
    optionId: "b"
  },
  {
    taskId: "react-1",
    kind: "short-text",
    text: "Props передаются компоненту извне, а state хранит его внутреннее состояние."
  },
  {
    taskId: "unknown",
    kind: "short-text",
    text: "Этот вопрос не засчитываем"
  }
];
const secondTrainingSet: TrainingSet = {
  id: "physics-basics",
  title: "Основы физики",
  tasks: [
    {
      id: "physics-1",
      kind: "single-choice",
      topic: "physics",
      prompt: "Как обозначается скорость?",
      options: [
        {
          id: "a",
          label: "v"
        },
        {
          id: "b",
          label: "m"
        },
        {
          id: "c",
          label: "F"
        }
      ]
    }
  ]
};
const emptyTrainingSet: TrainingSet = {
  id: "empty",
  title: "Пустой набор",
  tasks: []
};

// Сохраняем исходное состояние данных
const originalTasks = JSON.stringify(trainingSet.tasks);
const originalAnswers = JSON.stringify(answers);

console.log("Проверка существующего id:");
console.log(findTask(trainingSet.tasks, "ts-1"));

console.log("Проверка отсутствующего id:");
console.log(findTask(trainingSet.tasks, "unknown"));

console.log("Проверка поиска во втором наборе:");
console.log(findTask(secondTrainingSet.tasks, "physics-1"));

console.log("Проверка поиска в пустом наборе:");
console.log(findTask(emptyTrainingSet.tasks, "ts-1"));

console.log("Проверка фильтра с совпадениями:");
console.log(filterTasksByTopic(trainingSet.tasks, "typescript"));

console.log("Проверка фильтра без совпадений:");
console.log(filterTasksByTopic(trainingSet.tasks, "python"));

console.log("Проверка фильтра второго набора:");
console.log(filterTasksByTopic(secondTrainingSet.tasks, "physics"));

console.log("Проверка фильтра пустого набора:");
console.log(filterTasksByTopic(emptyTrainingSet.tasks, "physics"));

console.log("Проверка прогресса с полным набором:");
console.log(getProgress(trainingSet.tasks, answers));

console.log("Проверка прогресса с одним ответом:");
console.log(getProgress(trainingSet.tasks, 
  [
    {
      taskId: "ts-1",
      kind: "single-choice",
      optionId: "b"
    }
  ])
);

console.log("Проверка прогресса с пустым набором:");
console.log(getProgress(emptyTrainingSet.tasks, []));

console.log("Проверка ответа с другим taskId:");
console.log(getProgress(trainingSet.tasks, 
  [
    {
      taskId: "unknown",
      kind: "single-choice",
      optionId: "a"
    }
  ])
);

console.log("Проверка строки из пробелов:");
console.log(
  getProgress(trainingSet.tasks, [
    {
      taskId: "react-1",
      kind: "short-text",
      text: "   "
    }
  ])
);

console.log("Проверка прогресса второго набора:");
console.log(getProgress(secondTrainingSet.tasks, [
    {
      taskId: "physics-1",
      kind: "single-choice",
      optionId: "a"
    }
  ])
);

// Проверка отсутствия изменений во входных данных
console.log(originalTasks === JSON.stringify(trainingSet.tasks));
console.log(originalAnswers === JSON.stringify(answers));