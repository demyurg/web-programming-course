import { useState } from "react";
import { mainSet } from "./domain/demo.js";
import { findTask } from "./domain/domain.js";
import TaskList from "./components/TaskList";
import TaskCard from "./components/TaskCard";

export default function App() {
  
  const [selectedId, setSelectedId] = useState<string | null>(
    mainSet.tasks[0]?.id ?? null
  );

  
  const currentTask = selectedId ? findTask(mainSet, selectedId) : undefined;

  return (
    <main style={{ maxWidth: "900px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <header>
        <h1>{mainSet.title}</h1>
        <p>Всего заданий: {mainSet.tasks.length}</p>
      </header>

      <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
        <section style={{ flex: 1 }}>
          <TaskList
            tasks={mainSet.tasks}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        <section style={{ flex: 2 }}>
          {currentTask ? (
            <TaskCard task={currentTask} />
          ) : (
            <p style={{ color: "#666" }}>Выберите задание из списка или оно отсутствует.</p>
          )}
        </section>
      </div>
    </main>
  );
}