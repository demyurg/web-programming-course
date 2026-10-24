import { useState } from "react";
import { mainSet } from "./data"; 
import TaskList from "./TaskList";
import TaskCard from "./TaskCard";

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    mainSet.tasks[0]?.id ?? null
  );

  if (mainSet.tasks.length === 0) {
    return (
      <div>
        <h1>{mainSet.title}</h1>
        <p>В модуле пока нет заданий.</p>
      </div>
    );
  }

  const selectedTask = mainSet.tasks.find(
    (task) => task.id === selectedTaskId
  );

  let taskContent;
  if (selectedTask) {
    taskContent = <TaskCard task={selectedTask} />;
  } else {
    taskContent = <section><p>Задание не найдено.</p></section>;
  }

  return (
    <div>
      <h1>{mainSet.title}</h1>
      <p>Количество заданий: {mainSet.tasks.length}</p>

      <div className="container">
        <TaskList
          tasks={mainSet.tasks}
          onSelect={setSelectedTaskId}
          selectedId={selectedTaskId}
        />

        {taskContent}
      </div>
    </div>
  );
}