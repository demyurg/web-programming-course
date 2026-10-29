import { useState } from "react";
import { trainingSet } from "./taskCatalog";
import TaskNavigation from "./TaskNavigation";
import TaskDetails from "./TaskDetails";
export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    trainingSet.tasks[0]?.id ?? null
  );

  if (trainingSet.tasks.length === 0) {
    return (
      <div>
        <h1>{trainingSet.title}</h1>
        <p>В модуле пока нет заданий.</p>
      </div>
    );
  }

  const selectedTask = trainingSet.tasks.find(
    (task) => task.id === selectedTaskId
  );

  let taskContent;

  if (selectedTask) {
    taskContent = <TaskDetails task={selectedTask} />;
  } else {
    taskContent = <p>Задание не найдено.</p>;
  }

  return (
    <div>
      <h1>{trainingSet.title}</h1>
      <p>Количество заданий: {trainingSet.tasks.length}</p>

      <TaskNavigation
        tasks={trainingSet.tasks}
        onTaskSelect={setSelectedTaskId}
      />

      {taskContent}
    </div>
  );
}
