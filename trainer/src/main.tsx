import React, { useEffect, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Answer } from "./domain";
import { attemptReducer, initialAttemptState } from "./attempt";
import { calculateProgress, isAnswered } from "./domain";
import { createDraft, DRAFT_KEY, parseDraft } from "./draft";
import { AttemptReview } from "./AttemptReview";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import { trainingSet } from "./trainingSet";
import "./style.css";

type HydrationState =
    | { status: "loading" }
    | { status: "ready" }
    | { status: "invalid"; message: string };

function App() {
    const [state, dispatch] = useReducer(attemptReducer, initialAttemptState);
    const [hydration, setHydration] = useState<HydrationState>({ status: "loading" });
    const [storageWarning, setStorageWarning] = useState<string | null>(null);
    const { answers, currentIndex, status, confirming } = state;

    useEffect(() => {
        try {
            const result = parseDraft(window.localStorage.getItem(DRAFT_KEY));
            if (result.kind === "valid") {
                dispatch({ type: "restored", draft: result.draft });
                setHydration({ status: "ready" });
            } else if (result.kind === "invalid") {
                setHydration({ status: "invalid", message: result.message });
            } else {
                setHydration({ status: "ready" });
            }
        } catch {
            setStorageWarning("Хранилище недоступно. Ввод работает, но черновик не сохранится после перезагрузки.");
            setHydration({ status: "ready" });
        }
    }, []);

    useEffect(() => {
        if (hydration.status !== "ready") return;

        try {
            const draft = createDraft({ answers, currentIndex, status });
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            setStorageWarning(null);
        } catch {
            setStorageWarning("Не удалось сохранить черновик. Ввод работает в этой вкладке.");
        }
    }, [hydration.status, answers, currentIndex, status]);

    const tasks = trainingSet.tasks;
    const currentTask = tasks[currentIndex];
    const currentAnswer = answers.find((answer) => answer.taskId === currentTask?.id);
    const progress = calculateProgress(trainingSet, answers);
    const unansweredTasks = tasks.filter(
        (task) => !isAnswered(task, answers.find((answer) => answer.taskId === task.id))
    );
    const unansweredIds = new Set(unansweredTasks.map((task) => task.id));

    function replaceAnswer(next: Answer) {
        dispatch({ type: "answerChanged", answer: next });
    }

    function clearAnswer(taskId: string) {
        dispatch({ type: "answerCleared", taskId });
    }

    function startNewAttempt() {
        dispatch({ type: "reset" });
    }

    function resetInvalidDraft() {
        try {
            window.localStorage.removeItem(DRAFT_KEY);
        } catch {
            setStorageWarning("Не удалось очистить хранилище. Новая попытка работает в этой вкладке.");
        }
        dispatch({ type: "reset" });
        setHydration({ status: "ready" });
    }

    if (hydration.status === "loading") {
        return <main><h1>{trainingSet.title}</h1><p>Загрузка черновика…</p></main>;
    }

    if (hydration.status === "invalid") {
        return (
            <main>
                <h1>{trainingSet.title}</h1>
                <section className="confirmation" role="alert">
                    <h2>Не удалось восстановить черновик</h2>
                    <p>{hydration.message}</p>
                    <p>Можно сбросить его и начать новую попытку.</p>
                    <button type="button" onClick={resetInvalidDraft}>Сбросить черновик</button>
                </section>
            </main>
        );
    }

    return (
        <main>
            <h1>{trainingSet.title}</h1>
            {storageWarning && <p className="storage-warning" role="alert">{storageWarning}</p>}
            <p>Количество заданий: {tasks.length}</p>
            <p aria-live="polite">Прогресс: {progress.answered} из {progress.total}</p>

            {status === "submitted" ? (
                <>
                    <h2>Попытка завершена</h2>
                    <p>Ответы доступны только для просмотра.</p>
                    <AttemptReview tasks={tasks} answers={answers} submitted onClear={clearAnswer} />
                    <button type="button" onClick={startNewAttempt}>Начать новую попытку</button>
                </>
            ) : (
                <>
                    <TaskList
                        tasks={tasks}
                        currentId={currentTask?.id ?? ""}
                        unansweredIds={unansweredIds}
                        onSelect={(id) => dispatch({
                            type: "moved",
                            index: tasks.findIndex((task) => task.id === id),
                        })}
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
                                onAnswerClear={clearAnswer}
                            />
                            <nav className="attempt-actions" aria-label="Навигация по заданиям">
                                <button
                                    type="button"
                                    disabled={currentIndex === 0}
                                    onClick={() => dispatch({ type: "moved", index: currentIndex - 1 })}
                                >
                                    Назад
                                </button>
                                <button
                                    type="button"
                                    disabled={currentIndex === tasks.length - 1}
                                    onClick={() => dispatch({ type: "moved", index: currentIndex + 1 })}
                                >
                                    {isAnswered(currentTask, currentAnswer) ? "Далее" : "Пропустить"}
                                </button>
                            </nav>
                        </>
                    ) : (
                        <p>В наборе нет заданий.</p>
                    )}

                    <AttemptReview tasks={tasks} answers={answers} submitted={false} onClear={clearAnswer} />

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
                                <button type="button" onClick={() => dispatch({ type: "finishCanceled" })}>
                                    Отмена
                                </button>
                                <button type="button" onClick={() => dispatch({ type: "submitted" })}>
                                    Подтвердить завершение
                                </button>
                            </div>
                        </section>
                    ) : (
                        <button type="button" disabled={tasks.length === 0} onClick={() => dispatch({ type: "finishRequested" })}>
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
