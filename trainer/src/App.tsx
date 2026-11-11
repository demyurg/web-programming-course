import { useState } from "react";
import type { TrainingSet } from "./domain";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";

const set1: TrainingSet = {
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
  const [selectedId, setSelectedId] = useState<string>(set1.tasks[0]?.id ?? "");

  const selectedTask = set1.tasks.find((task) => task.id === selectedId);

  return (
    <main>
      <h1>{set1.title}</h1>

      <TaskList
        tasks={set1.tasks}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {selectedTask ? (
        <TaskCard task={selectedTask} />
      ) : (
        <p>Выберите задание из списка.</p>
      )}
    </main>
  );
}