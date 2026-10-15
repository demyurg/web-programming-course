import { useState } from "react";
import { mainSet } from "./data";
import { findTask } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  function handleSelect(id: string) {
    setSelectedTaskId(id);
  }

  const selectedTask =
    selectedTaskId === null ? undefined : findTask(mainSet, selectedTaskId);

  return (
    <main>
      <h1>
        {mainSet.title} — {mainSet.tasks.length} заданий
      </h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <TaskList tasks={mainSet.tasks} onSelect={handleSelect} />
        </div>
        <div style={{ flex: 2 }}>
          <TaskCard task={selectedTask} />
        </div>
      </div>
    </main>
  );
}