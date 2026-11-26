import { useState } from "react";
import { findTaskById } from "./domain";
import { sampleSet1 } from "./demo";
import { TaskList } from "./components/taskList";
import { TaskCard } from "./components/taskCard";

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    sampleSet1.tasks[0]?.id || null
  );

  const currentTask = selectedTaskId ? findTaskById(sampleSet1.tasks, selectedTaskId) : undefined;


  if (sampleSet1.tasks.length === 0 || !currentTask) {
    return (
      <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>{sampleSet1.title}</h1>
        <p style={{ color: "#666" }}>В этом модуле нет доступных заданий.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>

      <header style={{ marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <h1>{sampleSet1.title}</h1>
        <p style={{ color: "#555" }}>Всего заданий: <strong>{sampleSet1.tasks.length}</strong></p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "20px" }}>

        <TaskList
          tasks={sampleSet1.tasks}
          activeId={selectedTaskId}
          onSelect={setSelectedTaskId}
        />

        <TaskCard task={currentTask} />
      </div>
    </main>
  );
}
