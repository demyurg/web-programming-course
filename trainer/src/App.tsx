import { useState } from "react";
import { trainingSet } from "./data";
import { isAnswerFilled, calcProgress } from "./domain";
import type { Answer } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { Review } from "./Review";

type AttemptStatus = "in-progress" | "submitted"

export default function App() {
    const [answers, setAnswers] = useState<Answer[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    const [status, setStatus] = useState<AttemptStatus>("in-progress")

    const currentTask = trainingSet.tasks[currentIndex]
    const lastIndex = trainingSet.tasks.length - 1

    const currentAnswer = answers.find((answer) => answer.taskId === currentTask.id)
    const progress = calcProgress(trainingSet, answers)

    const unfilledTasks = trainingSet.tasks.filter((task) => {           // ← незаполненные
        const answer = answers.find((answer) => answer.taskId === task.id)
        return answer === undefined || !isAnswerFilled(answer)
    })

    function goPrev() {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    function goNext() {
        if (currentIndex < lastIndex) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    function selectTask(id: string) {
        const indexTask = trainingSet.tasks.findIndex((task) => task.id === id)
        if (indexTask !== -1) {
            setCurrentIndex(indexTask)
        }
    }

    function saveAnswer(newAnswer: Answer) {
        if (status === "submitted") return

        const newAnswers = answers.filter((answer) => answer.taskId !== newAnswer.taskId)

        setAnswers([...newAnswers, newAnswer])
    }

    function finishAttempt() {
        if (unfilledTasks.length > 0) {
            const numbers = unfilledTasks
                .map((task) => trainingSet.tasks.indexOf(task) + 1)
                .join(", ")
            const ok = window.confirm(`Не заполнены задания: ${numbers}. Всё равно завершить?`)
            if (!ok) return
        }
        setStatus("submitted")
    }

    function startNewAttempt() {
        setAnswers([])
        setCurrentIndex(0)
        setStatus("in-progress")
    }

    if (status === "submitted") {
        return (
            <main>
                <h1>{trainingSet.title}</h1>
                <Review tasks={trainingSet.tasks} answers={answers} onRestart={startNewAttempt} />
            </main>
        )
    }

    return (
        <main>
            <h1>{trainingSet.title} - {trainingSet.tasks.length} заданий</h1>
            <TaskList tasks={trainingSet.tasks} onSelect={selectTask} />
            <TaskCard task={currentTask}
                answer={currentAnswer}
                onAnswer={saveAnswer}

            />

            <section>
                <p>Заполнено: {progress.filled} из {progress.total}</p>
                {unfilledTasks.length > 0 ? (
                    <>
                        <p>Не заполнены:</p>
                        <ul>
                            {unfilledTasks.map((task) => (
                                <li key={task.id}>
                                    Задание {trainingSet.tasks.indexOf(task) + 1}: {task.prompt}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Все задания заполнены</p>
                )}
            </section>

            <nav>
                <button onClick={goPrev} disabled={currentIndex === 0}>Назад</button>
                <span>Задание {currentIndex + 1} из {trainingSet.tasks.length}</span>
                <button onClick={goNext} disabled={currentIndex === lastIndex}>Вперёд</button>
            </nav>

            <button onClick={finishAttempt}>Завершить попытку</button>
        </main>
    )
}