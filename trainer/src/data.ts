import type { TrainingSet } from "./domain";

export const webBasics: TrainingSet = {
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

export const cssBasics: TrainingSet = {
  id: "css-basics",
  title: "Основы CSS",
  tasks: [
    {
      id: "css-1",
      kind: "single-choice",
      topic: "css",
      prompt: "Какое свойство задаёт внешние отступы?",
      options: [
        { id: "a", label: "padding" },
        { id: "b", label: "margin" },
        { id: "c", label: "border" },
      ],
    },
    {
      id: "css-2",
      kind: "short-text",
      topic: "css",
      prompt: "Когда уместно использовать flex, а когда grid?",
    },
  ],
};

