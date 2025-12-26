import { Question } from '../types/quiz';

export const mockQuestions: Question[] = [
  {
    id: 1,
    question: "Что выведет console.log(typeof null)?",
    options: ["null", "undefined", "object", "number"],
    correctAnswer: 2,
    difficulty: "easy",
    maxPoints: 1
  },
  {
    id: 2,
    question: "Какой метод НЕ изменяет исходный массив?",
    options: ["push()", "pop()", "map()", "sort()"],
    correctAnswer: 2,
    difficulty: "medium",
    maxPoints: 2
  },
  {
    id: 3,
    question: "Что такое замыкание (closure)?",
    options: [
      "Функция внутри функции",
      "Функция с доступом к внешним переменным",
      "Закрытая функция",
      "Анонимная функция"
    ],
    correctAnswer: 1,
    difficulty: "hard",
    maxPoints: 3
  },
  {
    id: 4,
    question: "Чему равно '2' + 2?",
    options: ["'22'", "4", "NaN", "Error"],
    correctAnswer: 0,
    difficulty: "easy",
    maxPoints: 1
  },
  {
    id: 5,
    question: "Что выведет console.log([] == ![])?",
    options: ["true", "false", "undefined", "Error"],
    correctAnswer: 0,
    difficulty: "hard",
    maxPoints: 3
  },
  {
    id: 6,
    question: "Какие из следующих являются примитивными типами данных в JavaScript?",
    options: ["number", "function", "boolean", "string"],
    correctAnswer: [0, 2, 3], // number, boolean, string
    difficulty: "medium",
    maxPoints: 2
  },
  {
    id: 7,
    question: "Какие из следующих являются методами массива в JavaScript?",
    options: ["push()", "charAt()", "pop()", "map()"],
    correctAnswer: [0, 2, 3], // push(), pop(), map()
    difficulty: "easy",
    maxPoints: 1
  },
  {
    id: 8,
    question: "Какие из следующих утверждений верны для let и const в JavaScript?",
    options: [
      "let позволяет повторное объявление переменной",
      "const не позволяет изменять значение переменной",
      "let имеет блочную область видимости",
      "const требует инициализации при объявлении"
    ],
    correctAnswer: [2, 3], // let имеет блочную область видимости, const требует инициализации
    difficulty: "medium",
    maxPoints: 2
  },
  {
    id: 9,
    question: "Какие из следующих являются встроенными объектами в JavaScript?",
    options: ["Array", "Math", "Date", "Promise"],
    correctAnswer: [0, 1, 2, 3], // все перечисленные
    difficulty: "medium",
    maxPoints: 2
  },
  {
    id: 10,
    question: "Какие из следующих способов можно использовать для создания объекта в JavaScript?",
    options: [
      "Используя литерал объекта {}",
      "Используя конструктор new Object()",
      "Используя функцию-конструктор",
      "Используя Object.create()"
    ],
    correctAnswer: [0, 1, 2, 3], // все перечисленные
    difficulty: "easy",
    maxPoints: 1
  },
  {
    id: 11,
    question: "Какие из следующих являются асинхронными функциями в JavaScript?",
    options: ["Promise", "setTimeout", "async/await", "fetch"],
    correctAnswer: [0, 1, 2, 3], // все перечисленные
    difficulty: "hard",
    maxPoints: 3
  },
  {
    id: 12,
    question: "Какие из следующих являются методами для работы с DOM в JavaScript?",
    options: ["getElementById()", "querySelector()", "addEventListener()", "map()"],
    correctAnswer: [0, 1, 2], // getElementById(), querySelector(), addEventListener()
    difficulty: "medium",
    maxPoints: 2
  },
  {
    id: 13,
    question: "Какие из следующих утверждений верны для стрелочных функций в JavaScript?",
    options: [
      "У них нет собственного this",
      "Их можно использовать как конструкторы",
      "У них нет arguments",
      "Их нельзя использовать как генераторы"
    ],
    correctAnswer: [0, 2, 3], // нет собственного this, нет arguments, нельзя использовать как генераторы
    difficulty: "hard",
    maxPoints: 3
  },
  {
    id: 14,
    question: "Какие из следующих являются способами обработки ошибок в JavaScript?",
    options: ["try...catch", "throw", "Promise.catch()", "finally"],
    correctAnswer: [0, 1, 2, 3], // все перечисленные
    difficulty: "medium",
    maxPoints: 2
  },
  {
    id: 15,
    question: "Какие из следующих являются методами для работы с JSON в JavaScript?",
    options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.format()"],
    correctAnswer: [0, 1], // JSON.parse(), JSON.stringify()
    difficulty: "easy",
    maxPoints: 1
  }
];