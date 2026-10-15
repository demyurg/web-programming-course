import { useState } from "react";
import { findTask } from "./domain";
import { trainingSet } from "./set";
import { TaskCard } from "./components/TaskCard";
import { TaskList } from "./components/TaskList";

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState(() => trainingSet.tasks[0]?.id ?? "");
  const selectedTask = findTask(trainingSet, selectedTaskId);

  return (
    <main>
      <header>
        <h1>{trainingSet.title}</h1>
        <p>Заданий в наборе: {trainingSet.tasks.length}</p>
      </header>
      <TaskList
        tasks={trainingSet.tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
      />
      {selectedTask === undefined ? (
        <p className="empty-state">Задание не выбрано.</p>
      ) : (
        <TaskCard task={selectedTask} />
      )}
    </main>
  );
}
