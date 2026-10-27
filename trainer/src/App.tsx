import { useState } from "react";
import { mainSet } from "./demo";
import { findTaskById } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(
    mainSet.tasks[0]?.id ?? ""
  );

  const selectedTask = findTaskById(mainSet, selectedId);

  return (
    <main className="app">
      <header className="app__header">
        <h1>{mainSet.title}</h1>
        <p className="app__count">Заданий: {mainSet.tasks.length}</p>
      </header>

      <div className="app__layout">
        <aside className="app__sidebar">
          <TaskList
            tasks={mainSet.tasks}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <div className="app__content">
          <TaskCard task={selectedTask} />
        </div>
      </div>
    </main>
  );
}