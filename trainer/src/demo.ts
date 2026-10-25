import {
  type TrainingSet,
  type Answer,
  findTaskById,
  filterTasksByTopic,
  calculateProgress
} from "./domain.js";

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
        { id: "a", label: "105" },
        { id: "b", label: "50" },
        { id: "c", label: "Ошибка" }
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
    text: "Тестовый ответ"
  }
];

const secondTrainingSet: TrainingSet = {
  id: "second-set",
  title: "Дополнительный набор",
  tasks: [
    {
      id: "css-1",
      kind: "short-text",
      topic: "css",
      prompt: "Тестовый вопрос по CSS"
    }
  ]
};

const emptyTrainingSet: TrainingSet = {
  id: "empty-set",
  title: "Пустой набор",
  tasks: []
};


const trainingSetBefore = JSON.stringify(trainingSet);
const answersBefore = JSON.stringify(answers);



console.log("Поиск ts-1:");
console.log(findTaskById(trainingSet, "ts-1"));

console.log("Поиск несуществующего задания:");
console.log(findTaskById(trainingSet, "unknown"));

console.log("Задания по теме typescript:");
console.log(filterTasksByTopic(trainingSet, "typescript"));

console.log("Прогресс:");
console.log(calculateProgress(trainingSet, answers));




console.log("Фильтр без совпадений:");
console.log(filterTasksByTopic(trainingSet, "css"));

console.log("Прогресс с одним ответом:");
console.log(calculateProgress(trainingSet, [answers[0]]));

console.log("Прогресс пустого набора:");
console.log(calculateProgress(emptyTrainingSet, []));

const whitespaceAnswer: Answer[] = [
  {
    taskId: "react-1",
    kind: "short-text",
    text: "   "
  }
];

console.log("Ответ только из пробелов:");
console.log(calculateProgress(trainingSet, whitespaceAnswer));

const unknownAnswer: Answer[] = [
  {
    taskId: "unknown",
    kind: "short-text",
    text: "Тестовый ответ"
  }
];

console.log("Ответ с чужим taskId:");
console.log(calculateProgress(trainingSet, unknownAnswer));



console.log("Поиск во втором наборе:");
console.log(findTaskById(secondTrainingSet, "css-1"));

console.log("Фильтр второго набора по css:");
console.log(filterTasksByTopic(secondTrainingSet, "css"));



console.log("Исходный набор не изменился:");
console.log(JSON.stringify(trainingSet) === trainingSetBefore);

console.log("Массив ответов не изменился:");
console.log(JSON.stringify(answers) === answersBefore);
