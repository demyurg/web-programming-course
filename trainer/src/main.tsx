import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Answer } from "./domain";
import { calculateProgress, isAnswered } from "./domain";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import { trainingSet } from "./trainingSet";
import "./style.css";

function App() {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [status, setStatus] = useState<"active" | "submitted">("active");
    const [confirming, setConfirming] = useState(false);

    const tasks = trainingSet.tasks;
    const currentTask = tasks[currentIndex];
    const currentAnswer = answers.find((answer) => answer.taskId === currentTask?.id);
    const progress = calculateProgress(trainingSet, answers);
    const unansweredTasks = tasks.filter(
        (task) => !isAnswered(task, answers.find((answer) => answer.taskId === task.id))
    );
    const unansweredIds = new Set(unansweredTasks.map((task) => task.id));

    function replaceAnswer(next: Answer) {
        if (status !== "active") return;

        setAnswers((current) => [
            ...current.filter((answer) => answer.taskId !== next.taskId),
            next,
        ]);
    }

    function startNewAttempt() {
        setAnswers([]);
        setCurrentIndex(0);
        setStatus("active");
        setConfirming(false);
    }

    return (
        <main>
            <h1>{trainingSet.title}</h1>
            <p>Количество заданий: {tasks.length}</p>
            <p aria-live="polite">Прогресс: {progress.answered} из {progress.total}</p>

            {status === "submitted" ? (
                <section aria-label="Обзор ответов">
                    <h2>Попытка завершена</h2>
                    <p>Ответы можно изменить только после начала новой попытки.</p>
                    <ol className="review">
                        {tasks.map((task) => {
                            const answer = answers.find((item) => item.taskId === task.id);
                            let response = "Нет ответа";

                            if (isAnswered(task, answer)) {
                                if (answer?.kind === "single-choice" && task.kind === "single-choice") {
                                    response = task.options.find((option) => option.id === answer.optionId)?.label ?? answer.optionId;
                                } else if (answer?.kind === "short-text") {
                                    response = answer.text;
                                }
                            }

                            return (
                                <li key={task.id}>
                                    <strong>{task.prompt}</strong>
                                    <p className="review-answer">{response}</p>
                                </li>
                            );
                        })}
                    </ol>
                    <button type="button" onClick={startNewAttempt}>Начать новую попытку</button>
                </section>
            ) : (
                <>
                    <TaskList
                        tasks={tasks}
                        currentId={currentTask?.id ?? ""}
                        unansweredIds={unansweredIds}
                        onSelect={(id) => setCurrentIndex(tasks.findIndex((task) => task.id === id))}
                    />

                    <section aria-label="Задания без ответа">
                        <h2>Без ответа: {unansweredTasks.length}</h2>
                        {unansweredTasks.length === 0 ? (
                            <p>Все задания заполнены.</p>
                        ) : (
                            <ul>
                                {unansweredTasks.map((task) => (
                                    <li key={task.id}>{task.prompt}</li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {currentTask ? (
                        <>
                            <p>Задание {currentIndex + 1} из {tasks.length}</p>
                            <TaskCard
                                task={currentTask}
                                answer={currentAnswer}
                                onAnswerChange={replaceAnswer}
                            />
                            <nav className="attempt-actions" aria-label="Навигация по заданиям">
                                <button
                                    type="button"
                                    disabled={currentIndex === 0}
                                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                                >
                                    Назад
                                </button>
                                <button
                                    type="button"
                                    disabled={currentIndex === tasks.length - 1}
                                    onClick={() => setCurrentIndex((index) => Math.min(tasks.length - 1, index + 1))}
                                >
                                    {isAnswered(currentTask, currentAnswer) ? "Далее" : "Пропустить"}
                                </button>
                            </nav>
                        </>
                    ) : (
                        <p>В наборе нет заданий.</p>
                    )}

                    {confirming ? (
                        <section className="confirmation" aria-label="Подтверждение завершения">
                            <h2>Завершить попытку?</h2>
                            {unansweredTasks.length > 0 ? (
                                <p>
                                    Остались без ответа: {unansweredTasks.map((task) =>
                                        `${tasks.indexOf(task) + 1} (${task.id})`
                                    ).join(", ")}.
                                </p>
                            ) : (
                                <p>Все задания заполнены.</p>
                            )}
                            <div className="attempt-actions">
                                <button type="button" onClick={() => setConfirming(false)}>
                                    Отмена
                                </button>
                                <button type="button" onClick={() => {
                                    setStatus("submitted");
                                    setConfirming(false);
                                }}>
                                    Подтвердить завершение
                                </button>
                            </div>
                        </section>
                    ) : (
                        <button type="button" disabled={tasks.length === 0} onClick={() => setConfirming(true)}>
                            Завершить попытку
                        </button>
                    )}
                </>
            )}
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
