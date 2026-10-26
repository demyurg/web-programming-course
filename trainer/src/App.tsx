import { useState } from "react";
import type { TrainingSet } from "./domain";
import { findTaskById } from "./domain";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";

const moduleSet: TrainingSet = {
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
    {
      id: "react-2",
      kind: "single-choice",
      topic: "react",
      prompt: "Почему в списке элементов рекомендуется использовать стабильный key, а не индекс массива?",
      options: [
        { id: "a", label: "Потому что индекс запрещён в React" },
        { id: "b", label: "Потому что при вставке или удалении элемента индекс меняется и React может перепутать строки" },
        { id: "c", label: "Потому что индекс работает только в классовых компонентах" },
        { id: "d", label: "Потому что index замедляет рендер в 10 раз" },
      ],
    },
    {
      id: "html-1",
      kind: "short-text",
      topic: "html",
      prompt: "Зачем нужен <form> в HTML?",
    },
  ],
};

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(moduleSet.tasks[0]?.id ?? "");

  const currentTask = findTaskById(moduleSet.tasks, selectedId);

  if (moduleSet.tasks.length === 0) {
    return (
      <main>
        <h1>{moduleSet.title}</h1>
        <p>В модуле нет заданий.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>
        {moduleSet.title} — заданий: {moduleSet.tasks.length}
      </h1>
        
          <TaskList
            tasks={moduleSet.tasks}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {currentTask ? (
            <TaskCard task={currentTask} />
          ) : (
            <p>Выбранное задание не найдено.</p>
          )}
    </main>
  );
}