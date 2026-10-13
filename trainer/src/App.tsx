import { useState } from "react";
import type { TrainingSet, Task } from "./domain";
import { findTask } from "./domain";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";

// Локальный набор из A1
const mainSet: TrainingSet = {
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

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: Task | undefined = selectedId
    ? findTask(mainSet, selectedId)
    : undefined;

  return (
    <main>
      <h1>{mainSet.title}</h1>
      <p>Заданий: {mainSet.tasks.length}</p>

      <TaskList
        tasks={mainSet.tasks}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {selected ? (
        <TaskCard task={selected} />
      ) : (
        <p>Выберите задание из списка.</p>
      )}
    </main>
  );
}