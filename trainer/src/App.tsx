import { useState } from "react";
import { findTaskById, type TrainingSet } from "./domain";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";

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
  const [selectedId, setSelectedId] = useState("ts-1");
  const selectedTask = findTaskById(trainingSet, selectedId);

  return (
    <main>
      <h1>
        {trainingSet.title} : {trainingSet.tasks.length}
      </h1>
      <TaskList tasks={trainingSet.tasks} onSelect={setSelectedId} />
      {selectedTask ? (
        <TaskCard task={selectedTask} />
      ) : (
        <p>Нет выбранного задания.</p>
      )}
    </main>
  );
}
