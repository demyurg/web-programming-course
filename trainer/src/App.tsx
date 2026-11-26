import { useState } from "react";
import { Task, TrainingSet, module1, findTaskById } from "./domain";
import { ModuleHeader } from "./ModuleHeader";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

export default function App() {
  const trainingSet: TrainingSet = module1;
  const tasks: Task[] = trainingSet.tasks;

  const [selectedId, setSelectedId] = useState<string | null>(
    tasks.length > 0 ? tasks[0].id : null
  );

  const currentTask: Task | undefined = findTaskById(trainingSet, selectedId || "");

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <ModuleHeader title={trainingSet.title} count={tasks.length} />

      {tasks.length === 0 ? (
        <p>В этом модуле пока нет заданий.</p>
      ) : !currentTask ? (
        <p>Задание не найдено.</p>
      ) : (
        <>
          <TaskList tasks={tasks} selectedId={selectedId} onChoose={setSelectedId} />
          <TaskCard task={currentTask} />
        </>
      )}
    </main>
  );
}