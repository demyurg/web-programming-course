import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { findTask } from "./domain";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import { trainingSet } from "./trainingSet";
import "./style.css";

function App() {
    const [selectedId, setSelectedId] = useState<string>(trainingSet.tasks[0]?.id ?? "");
    const selectedTask = findTask(trainingSet, selectedId);

    return (
        <main>
            <h1>{trainingSet.title}</h1>
            <p>Количество заданий: {trainingSet.tasks.length}</p>
            <TaskList tasks={trainingSet.tasks} onSelect={setSelectedId} />
            {selectedTask ? <TaskCard task={selectedTask} /> : <p>Задание не выбрано.</p>}
        </main>
    );
}

const root = document.getElementById("root");

if (root) {
    createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
