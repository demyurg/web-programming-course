
import { useState } from "react";
import { trainingSet } from "./data.js";
import { findTaskById } from "./domain.js";
import { TaskList } from "./TaskList.js";
import { TaskCard } from "./TaskCard.js";

export function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    trainingSet.tasks[0]?.id ?? "",
  );

  const selectedTask = findTaskById(trainingSet, selectedTaskId);

  return (
    <main>
      <header>
        <h1>{trainingSet.title}</h1>
        <p>Количество заданий: {trainingSet.tasks.length}</p>
      </header>

      {trainingSet.tasks.length === 0 || !selectedTask ? (
        <p role="status">Нет выбранного задания.</p>
      ) : (
        <div className="layout">
          <TaskList
            tasks={trainingSet.tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />

          <TaskCard task={selectedTask} />
        </div>
      )}
    </main>
  );
}
