import "./App.css";

import TaskCard from "./components/TaskCard";
import TaskList from "./components/TaskList";
import AttemptReview from "./components/AttemptReview";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
    ApiAnswer,
    ApiAttempt,
    ApiResult,
    ApiSet,
    ApiTask,
} from "./api/trainerApi";
import {
    ApiError,
    createAttempt,
    deleteAnswer,
    fetchSet,
    getAttempt,
    getResult,
    putAnswer,
    submitAttempt,
} from "./api/trainerApi";


const SET_ID = "web-basics";
const ATTEMPT_ID_KEY = "trainer.attemptId";

function readStoredAttemptId(): string | null {
    try {
        return localStorage.getItem(ATTEMPT_ID_KEY);
    } catch {
        return null;
    }
}

function storeAttemptId(id: string | null) {
    try {
        if (id) localStorage.setItem(ATTEMPT_ID_KEY, id);
        else localStorage.removeItem(ATTEMPT_ID_KEY);
    } catch {
        //localStorage может быть недоступен — не критично
    }
}

function describeError(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.code === "NETWORK_ERROR") {
            return "Нет соединения с учебным сервером. Проверьте, запущен ли сервер, и повторите.";
        }
        return error.message;
    }
    return "Неизвестная ошибка.";
}

export default function App() {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    //данные модуля с сервера
    const [set, setSet] = useState<ApiSet | null>(null);
    const [setLoading, setSetLoading] = useState(true);
    const [setError, setSetError] = useState<string | null>(null);

    //попытка на сервере
    const [attempt, setAttempt] = useState<ApiAttempt | null>(null);
    const [attemptLoading, setAttemptLoading] = useState(false);
    const [attemptError, setAttemptError] = useState<string | null>(null);

    //результат после submit
    const [result, setResult] = useState<ApiResult | null>(null);
    const [resultError, setResultError] = useState<string | null>(null);

    //во время любого запроса блокируем действия
    const [busy, setBusy] = useState(false);

    //повтор последнего действия
    const [retry, setRetry] = useState<(() => void) | null>(null);

    const [showReview, setShowReview] = useState(false);

    const answers: ApiAnswer[] = attempt?.answers ?? [];
    const submitted = attempt?.status === "submitted";

    const selectedTask: ApiTask | undefined = useMemo(() => {
        if (!set || !selectedTaskId) return undefined;
        return set.tasks.find((task) => task.id === selectedTaskId);
    }, [set, selectedTaskId]);

    const selectedTaskIndex = useMemo(() => {
        if (!set || !selectedTaskId) return -1;
        return set.tasks.findIndex((task) => task.id === selectedTaskId);
    }, [set, selectedTaskId]);

    const progress = useMemo(() => {
        const total = set?.tasks.length ?? 0;
        const completed = answers.length;
        return { completed, total };
    }, [set, answers]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setSetLoading(true);
            setSetError(null);
            try {
                const data = await fetchSet(SET_ID);
                if (cancelled) return;
                setSet(data);
                setSelectedTaskId((prev) => prev ?? data.tasks[0]?.id ?? null);
            } catch (error) {
                if (cancelled) return;
                setSetError(describeError(error));
            } finally {
                if (!cancelled) setSetLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const storedId = readStoredAttemptId() as string;
        if (!storedId) return;

        let cancelled = false;

        async function restore() {
            setAttemptLoading(true);
            setAttemptError(null);
            try {
                const data = await getAttempt(storedId);
                if (cancelled) return;
                setAttempt(data);
                setSelectedTaskId((prev) => prev ?? set?.tasks[0]?.id ?? null);

                if (data.status === "submitted") {
                    try {
                        const r = await getResult(storedId);
                        if (!cancelled) setResult(r);
                    } catch (error) {
                        if (!cancelled) setResultError(describeError(error));
                    }
                }
            } catch {
                if (cancelled) return;
                setAttemptError(
                    "Не удалось восстановить подтверждённую попытку. Начните новую."
                );
                storeAttemptId(null);
            } finally {
                if (!cancelled) setAttemptLoading(false);
            }
        }

        void restore();
        return () => {
            cancelled = true;
        };
    }, [set]);

    const startAttempt = async () => {
        if (busy) return;
        setBusy(true);
        setAttemptError(null);
        setResult(null);
        setResultError(null);
        setShowReview(false);

        try {
            const data = await createAttempt(SET_ID);
            storeAttemptId(data.id);
            setAttempt(data);
            setRetry(null);
        } catch (error) {
            setAttemptError(describeError(error));
            setRetry(() => startAttempt);
        } finally {
            setBusy(false);
        }
    };

    const saveAnswer = async (answer: ApiAnswer) => {
        if (!attempt || busy) return;

        const previousAttempt = attempt;
        const optimistic: ApiAttempt = {
            ...attempt,
            answers: [
                ...attempt.answers.filter((a) => a.taskId !== answer.taskId),
                answer,
            ],
        };
        setAttempt(optimistic);

        //если это текстовый ответ — ждем, пока пользователь перестанет печатать
        if (answer.kind === "short-text") {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);

            saveTimeout.current = setTimeout(async () => {
                setBusy(true);
                setAttemptError(null);
                try {
                    const updated = await putAnswer(attempt.id, answer);
                    setAttempt(updated);
                    setRetry(null);
                } catch (error) {
                    setAttempt(previousAttempt);
                    setAttemptError(describeError(error));
                    setRetry(() => () => void saveAnswer(answer));
                } finally {
                    setBusy(false);
                }
            }, 500);                                        //ждем полсекунды после последней буквы

            return;                                         //выходим, чтобы не отправлять сразу
        }

        //если это выбор варианта — отправляем сразу
        setBusy(true);
        setAttemptError(null);

        try {
            const updated = await putAnswer(attempt.id, answer);
            setAttempt(updated);
            setRetry(null);
        } catch (error) {
            setAttempt(previousAttempt);
            setAttemptError(describeError(error));
            setRetry(() => () => void saveAnswer(answer));
        } finally {
            setBusy(false);
        }
    };

    const clearAnswer = async (taskId: string) => {
        if (!attempt || busy) return;

        const previousAttempt = attempt;
        const optimistic: ApiAttempt = {
            ...attempt,
            answers: attempt.answers.filter((a) => a.taskId !== taskId),
        };
        setAttempt(optimistic);
        setBusy(true);
        setAttemptError(null);

        try {
            const updated = await deleteAnswer(attempt.id, taskId);
            setAttempt(updated);
            setRetry(null);
        } catch (error) {
            setAttempt(previousAttempt);
            setAttemptError(describeError(error));
            setRetry(() => () => void clearAnswer(taskId));
        } finally {
            setBusy(false);
        }
    };

    const finishAttempt = async () => {
        if (!attempt || busy) return;

        const completed = attempt.answers.length;
        const total = set?.tasks.length ?? 0;
        if (completed < total) {
            const confirmed = window.confirm(
                `Осталось неотвеченных заданий: ${total - completed}. Завершить попытку?`
            );
            if (!confirmed) return;
        }

        setBusy(true);
        setAttemptError(null);
        setResultError(null);

        try {
            const r = await submitAttempt(attempt.id);
            setResult(r);
            setAttempt((prev) => (prev ? { ...prev, status: "submitted" } : prev));
            setRetry(null);
        } catch (error) {
            setAttemptError(describeError(error));
            setRetry(() => finishAttempt);
        } finally {
            setBusy(false);
        }
    };

    const restart = async () => {
        storeAttemptId(null);
        setAttempt(null);
        setResult(null);
        setResultError(null);
        setAttemptError(null);
        setShowReview(false);
        await startAttempt();
    };

    return (
        <main>
            {setLoading && (
                <section>
                    <h1>Загрузка модуля…</h1>
                </section>
            )}

            {!setLoading && (setError || !set) && (
                <section>
                    <h1>Не удалось загрузить модуль</h1>
                    <p>{setError ?? "Модуль не найден."}</p>
                    <button type="button" onClick={() => window.location.reload()}>
                        Повторить
                    </button>
                </section>
            )}

            {!setLoading && set && (
                <>
                    <h1>{set.title}</h1>
                    <p>Всего заданий: {set.tasks.length}</p>

                    {attemptError && (
                        <section role="alert">
                            <p>{attemptError}</p>
                            {retry && (
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => {
                                        const action = retry;
                                        setRetry(null);
                                        action();
                                    }}
                                >
                                    Повторить
                                </button>
                            )}
                        </section>
                    )}

                    {attemptLoading && <p>Восстановление попытки…</p>}

                    {!attempt && !attemptLoading && (
                        <section>
                            <p>Попытка ещё не создана.</p>
                            <button type="button" disabled={busy} onClick={() => void startAttempt()}>
                                Начать попытку
                            </button>
                        </section>
                    )}

                    {attempt && submitted && result && (
                        <section>
                            <h2>Попытка завершена</h2>
                            <p>
                                Статус:{" "}
                                {result.status === "pending-review"
                                    ? "ожидает проверки"
                                    : "проверено"}
                            </p>
                            <p>
                                Результат:{" "}
                                {result.score === null
                                    ? "ожидает проверки"
                                    : `${result.score} из ${result.maxScore}`}
                            </p>

                            <h2>Ответы:</h2>
                            {set.tasks.map((task) => {
                                const item = result.items.find((i) => i.taskId === task.id);
                                return (
                                    <section key={task.id}>
                                        <h3>{task.prompt}</h3>
                                        <p>
                                            {item
                                                ? item.status === "pending-review"
                                                    ? "Ожидает проверки"
                                                    : `${item.status}, ${item.score ?? 0} из ${item.maxScore}`
                                                : "Нет данных"}
                                        </p>
                                        {item && <p>{item.feedback}</p>}
                                    </section>
                                );
                            })}

                            <button type="button" disabled={busy} onClick={() => void restart()}>
                                Начать новую попытку
                            </button>
                        </section>
                    )}

                    {attempt && submitted && !result && (
                        <section>
                            <h2>Попытка отправлена</h2>
                            {resultError && <p>{resultError}</p>}
                            <button
                                type="button"
                                disabled={busy}
                                onClick={async () => {
                                    setBusy(true);
                                    setResultError(null);
                                    try {
                                        const r = await getResult(attempt.id);
                                        setResult(r);
                                    } catch (error) {
                                        setResultError(describeError(error));
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                            >
                                Получить результат
                            </button>
                        </section>
                    )}

                    {attempt && !submitted && (
                        <>
                            <p>
                                Прогресс: {progress.completed} из {progress.total}
                            </p>
                            <h2>Неотвеченные задания: {progress.total - progress.completed}</h2>
                            <div className="trainer-layout">

                                <aside className="trainer-sidebar">
                                    <h2>Список заданий</h2>
                                    <TaskList
                                        tasks={set.tasks}
                                        answers={answers}
                                        selectedTaskId={selectedTaskId}
                                        onSelect={setSelectedTaskId}
                                    />
                                </aside>

                                <div className="trainer-content">
                                    {selectedTask ? (
                                        <>
                                            <TaskCard
                                                task={selectedTask}
                                                disabled={busy}
                                                answer={answers.find((a) => a.taskId === selectedTask.id)}
                                                onAnswerChange={(newAnswer) => void saveAnswer(newAnswer)}
                                                onClearAnswer={(taskId) => void clearAnswer(taskId)}
                                            />

                                            <div>
                                                <button
                                                    type="button"
                                                    disabled={selectedTaskIndex <= 0}
                                                    onClick={() => {
                                                        const previousTask = set.tasks[selectedTaskIndex - 1];
                                                        if (previousTask) setSelectedTaskId(previousTask.id);
                                                    }}
                                                >
                                                    Предыдущее
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={selectedTaskIndex >= set.tasks.length - 1}
                                                    onClick={() => {
                                                        const nextTask = set.tasks[selectedTaskIndex + 1];
                                                        if (nextTask) setSelectedTaskId(nextTask.id);
                                                    }}
                                                >
                                                    Следующее
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setShowReview((v) => !v)}
                                            >
                                                {showReview ? "Скрыть обзор" : "Обзор ответов"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => void finishAttempt()}
                                            >
                                                Завершить попытку
                                            </button>
                                        </>
                                    ) : (
                                        <p>Задание не найдено. Выберите другое из списка.</p>
                                    )}

                                    {showReview && (
                                        <AttemptReview
                                            tasks={set.tasks}
                                            answers={answers}
                                            canClear={!submitted}
                                            busy={busy}
                                            onClearAnswer={(taskId) => void clearAnswer(taskId)}
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </main>
    );
}