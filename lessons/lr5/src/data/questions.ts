import { Question } from '../types/quiz';

export const mockQuestions: Question[] = [
  {
    id: '1',  // <-- Фикс: строка
    question: "Что выведет console.log(typeof null)?",
    options: ["null", "undefined", "object", "number"],
    correctAnswer: [2],  // <-- Фикс: массив
    difficulty: "easy"
  },
  {
    id: '2',  // <-- Фикс: строка
    question: "Какой метод НЕ изменяет исходный массив?",
    options: ["push()", "pop()", "map()", "sort()"],
    correctAnswer: [2],  // <-- Фикс: массив
    difficulty: "medium"
  },
  {
    id: '3',  // <-- Фикс: строка
    question: "Что такое замыкание (closure)?",
    options: [
      "Функция внутри функции",
      "Функция с доступом к внешним переменным",
      "Закрытая функция",
      "Анонимная функция"
    ],
    correctAnswer: [1],  // <-- Фикс: массив
    difficulty: "hard"
  },
  {
    id: '4',  // <-- Фикс: строка
    question: "Чему равно '2' + 2?",
    options: ["'22'", "4", "NaN", "Error"],
    correctAnswer: [0],  // <-- Фикс: массив
    difficulty: "easy"
  },
  {
    id: '5',  // <-- Фикс: строка
    question: "Что выведет console.log([] == ![])?",
    options: ["true", "false", "undefined", "Error"],
    correctAnswer: [0],  // <-- Фикс: массив
    difficulty: "hard"
  }
];