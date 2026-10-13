import { useState } from "react";
import { trainingSet } from "./data";
import { findTask } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

export default function App() {
    const [selectedId, setSelectedId] = useState(trainingSet.tasks[0]?.id ?? "")
    const selected = findTask(trainingSet, selectedId)

    return(
        <main>
            <h1>{trainingSet.title} - {trainingSet.tasks.length} заданий</h1>
            <TaskList tasks={trainingSet.tasks} onSelect={setSelectedId} />
            <TaskCard task={selected}/>   
        </main>
    )
}