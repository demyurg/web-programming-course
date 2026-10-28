import { useState } from "react";
import type { TrainingSet, Task } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

const task1: Task = {
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
};

const task2: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

const trainingSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [task1, task2],
};

export default function App() {
  const [selectedId, setSelectedId] = useState("ts-1");

  // Ищем выбранное задание 
  let selectedTask: Task | undefined = undefined;
  for (const t of trainingSet.tasks) {
    if (t.id === selectedId) {
      selectedTask = t;
      break;
    }
  }

  let cardBlock;
  if (selectedTask) {
    cardBlock = <TaskCard task={selectedTask} />;
  } else {
    cardBlock = <p>Задание не найдено.</p>;
  }

  return (
    <main>
      <h1>{trainingSet.title}</h1>
      <p>Заданий в модуле: {trainingSet.tasks.length}</p>

      <div className="task-layout">
        <TaskList
          tasks={trainingSet.tasks}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {cardBlock}
      </div>
    </main>
  );
}