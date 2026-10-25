import TaskCard from "./TaskCard";
import TaskList from "./TaskList";

import { useState } from "react";
import { trainingSet } from "./trainingData";

export default function App() {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
        trainingSet.tasks[0]?.id ?? null
    );

    const selectedTask = trainingSet.tasks.find(
        (task) => task.id === selectedTaskId
    );

    return (
        <main>
            <h1>{trainingSet.title}</h1>
            <p>Всего заданий: {trainingSet.tasks.length}</p>

            <h2>Список заданий</h2>

            <TaskList tasks={trainingSet.tasks} onSelect={setSelectedTaskId} />

            {selectedTask ? (
                <TaskCard task={selectedTask} />
            ) : trainingSet.tasks.length === 0 ? (
                <p>В наборе нет заданий.</p>
            ) : (
                <p>Задание не найдено. Выберите другое из списка.</p>
            )}
        </main>
    );
}