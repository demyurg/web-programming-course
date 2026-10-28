import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import { findTask, type TrainingSet } from "./domain";

const set: TrainingSet = {
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
  const selectedTask = findTask(set, selectedId);

  return (
    <main>
      <h1>
        {set.title} ({set.tasks.length})
      </h1>
      <div className="layout">
        <section>
          <h2>Список</h2>
          <TaskList
            tasks={set.tasks}
            selectedId={selectedId}
            onChoose={setSelectedId}
          />
          <p>
            <button type="button" onClick={() => setSelectedId("no-such-id")}>
              Показать отсутствующий id
            </button>
          </p>
        </section>
        <section>
          <h2>Задание</h2>
          <TaskCard task={selectedTask} />
        </section>
      </div>
    </main>
  );
}
