import { useEffect, useReducer, useState } from "react";
import trainingSetData from "../../course/data/training-set.json";
import {
    calculateProgress,
    isAnswered,
    type Answer,
    type Task,
    type TrainingSet,
} from "./domain";

const trainingSet = trainingSetData as TrainingSet;

type AttemptState = {
    answers: Answer[];
    currentIndex: number;
    status: "in-progress" | "submitted";
};

type Draft = {
    version: 1;
    setId: string;
    taskId: string;
    answers: Answer[];
    status: "in-progress" | "submitted";
};

type AttemptEvent =
    | { type: "answerChanged"; answer: Answer }
    | { type: "moved"; index: number }
    | { type: "restored"; draft: Draft }
    | { type: "reset" }
    | { type: "submitted" };

const draftStorageKey = "trainer.attempt-draft";

const initialAttempt: AttemptState = {
    answers: [],
    currentIndex: 0,
    status: "in-progress",
};

function attemptReducer(state: AttemptState, event: AttemptEvent): AttemptState {
    if (event.type === "reset") {
        return initialAttempt;
    }

    if (event.type === "restored") {
        const index = trainingSet.tasks.findIndex((task) => task.id === event.draft.taskId);
        return {
            answers: event.draft.answers,
            currentIndex: Math.max(0, index),
            status: event.draft.status,
        };
    }

    if (state.status === "submitted") {
        return state;
    }

    switch (event.type) {
        case "answerChanged":
            return {
                ...state,
                answers: [
                    ...state.answers.filter((answer) => answer.taskId !== event.answer.taskId),
                    event.answer,
                ],
            };
        case "moved":
            return {
                ...state,
                currentIndex: Math.max(0, Math.min(event.index, trainingSet.tasks.length - 1)),
            };
        case "submitted":
            return { ...state, status: "submitted" };
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateDraft(value: unknown):
    | { valid: true; draft: Draft }
    | { valid: false; message: string } {
    if (!isRecord(value)) {
        return { valid: false, message: "Черновик повреждён: ожидался объект с данными попытки." };
    }
    if (value.version !== 1) {
        return { valid: false, message: "Черновик использует неизвестную версию формата." };
    }
    if (value.setId !== trainingSet.id) {
        return { valid: false, message: "Черновик относится к другому набору заданий." };
    }
    if (value.status !== "in-progress" && value.status !== "submitted") {
        return { valid: false, message: "В черновике указан недопустимый статус попытки." };
    }
    if (
        typeof value.taskId !== "string" ||
        (trainingSet.tasks.length > 0 &&
            !trainingSet.tasks.some((task) => task.id === value.taskId)) ||
        (trainingSet.tasks.length === 0 && value.taskId !== "")
    ) {
        return { valid: false, message: "Текущее задание из черновика отсутствует в этом наборе." };
    }
    if (!Array.isArray(value.answers)) {
        return { valid: false, message: "Черновик повреждён: список ответов имеет неверный формат." };
    }

    const answers: Answer[] = [];
    const seenTaskIds = new Set<string>();

    for (const item of value.answers) {
        if (!isRecord(item) || typeof item.taskId !== "string" || seenTaskIds.has(item.taskId)) {
            return { valid: false, message: "Черновик содержит некорректный или повторный ответ." };
        }

        const task = trainingSet.tasks.find((candidate) => candidate.id === item.taskId);
        if (!task) {
            return { valid: false, message: "В черновике есть ответ на задание из другого набора." };
        }

        if (
            task.kind === "single-choice" &&
            item.kind === "single-choice" &&
            typeof item.optionId === "string" &&
            task.options.some((option) => option.id === item.optionId)
        ) {
            answers.push({
                taskId: item.taskId,
                kind: "single-choice",
                optionId: item.optionId,
            });
        } else if (
            task.kind === "short-text" &&
            item.kind === "short-text" &&
            typeof item.text === "string"
        ) {
            answers.push({ taskId: item.taskId, kind: "short-text", text: item.text });
        } else {
            return { valid: false, message: "Черновик содержит ответ неподходящего формата." };
        }

        seenTaskIds.add(item.taskId);
    }

    return {
        valid: true,
        draft: {
            version: 1,
            setId: trainingSet.id,
            taskId: value.taskId,
            answers,
            status: value.status,
        },
    };
}

type TaskListProps = {
    tasks: Task[];
    currentIndex: number;
    answers: Answer[];
    onChoose: (index: number) => void;
};

function TaskList({ tasks, currentIndex, answers, onChoose }: TaskListProps) {
    if (tasks.length === 0) {
        return <p className="empty-list">В этом наборе пока нет заданий.</p>;
    }

    return (
        <nav className="task-list" aria-label="Задания набора">
            {tasks.map((task, index) => {
                const answer = answers.find((item) => item.taskId === task.id);
                const completed = isAnswered(answer);

                return (
                    <button
                        className={`task-button${index === currentIndex ? " is-selected" : ""}`}
                        key={task.id}
                        type="button"
                        aria-current={index === currentIndex ? "step" : undefined}
                        onClick={() => onChoose(index)}
                    >
                        <span className="task-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="task-button-copy">
                            <span className="task-button-topic">{task.topic}</span>
                            <span className="task-button-title">{task.prompt}</span>
                            <span className={`task-status${completed ? " is-complete" : ""}`}>
                                {completed ? "Ответ дан" : "Не заполнено"}
                            </span>
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

type TaskFormProps = {
    task: Task;
    answer: Answer | undefined;
    onAnswerChange: (answer: Answer) => void;
};

function TaskForm({ task, answer, onAnswerChange }: TaskFormProps) {
    return (
        <article className="task-card">
            <div className="task-card-meta">
                <span className="eyebrow">{task.topic}</span>
                <span className="kind-label">
                    {task.kind === "single-choice" ? "Выбор ответа" : "Короткий ответ"}
                </span>
            </div>

            <h2>{task.prompt}</h2>

            {task.code !== undefined && (
                <pre className="code-sample"><code>{task.code}</code></pre>
            )}

            {task.kind === "single-choice" ? (
                <fieldset className="answer-fieldset">
                    <legend>Выберите один вариант</legend>
                    <div className="options-list">
                        {task.options.map((option) => (
                            <label className="option" key={option.id}>
                                <input
                                    checked={
                                        answer?.kind === "single-choice" &&
                                        answer.optionId === option.id
                                    }
                                    name={`answer-${task.id}`}
                                    onChange={() =>
                                        onAnswerChange({
                                            taskId: task.id,
                                            kind: "single-choice",
                                            optionId: option.id,
                                        })
                                    }
                                    type="radio"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            ) : (
                <label className="text-answer-label" htmlFor={`answer-${task.id}`}>
                    Ваш ответ
                    <textarea
                        id={`answer-${task.id}`}
                        onChange={(event) =>
                            onAnswerChange({
                                taskId: task.id,
                                kind: "short-text",
                                text: event.currentTarget.value,
                            })
                        }
                        placeholder="Введите короткий ответ"
                        rows={5}
                        value={answer?.kind === "short-text" ? answer.text : ""}
                    />
                </label>
            )}
        </article>
    );
}

function SubmittedOverview({ answers, onRestart }: { answers: Answer[]; onRestart: () => void }) {
    return (
        <section className="submitted-view" aria-labelledby="submitted-title">
            <p className="eyebrow">Локальная попытка</p>
            <h2 id="submitted-title">Попытка завершена</h2>
            <p>Ответы сохранены в этом окне. Оценивание не выполнялось.</p>

            <ol className="review-list">
                {trainingSet.tasks.map((task, index) => {
                    const answer = answers.find((item) => item.taskId === task.id);
                    let response = "Не заполнено";

                    if (task.kind === "single-choice" && answer?.kind === "single-choice") {
                        response =
                            task.options.find((option) => option.id === answer.optionId)?.label ??
                            "Не заполнено";
                    } else if (
                        task.kind === "short-text" &&
                        answer?.kind === "short-text" &&
                        isAnswered(answer)
                    ) {
                        response = answer.text;
                    }

                    return (
                        <li className="review-item" key={task.id}>
                            <span className="review-topic">
                                Задание {index + 1} · {task.topic}
                            </span>
                            <h3>{task.prompt}</h3>
                            <p className={response === "Не заполнено" ? "is-unanswered" : ""}>
                                {response}
                            </p>
                        </li>
                    );
                })}
            </ol>

            <button className="primary-button" onClick={onRestart} type="button">
                Начать новую попытку
            </button>
        </section>
    );
}

export default function App() {
    const [attempt, dispatch] = useReducer(attemptReducer, initialAttempt);
    const [isHydrated, setIsHydrated] = useState(false);
    const [draftIssue, setDraftIssue] = useState<string | null>(null);
    const [storageWarning, setStorageWarning] = useState<string | null>(null);
    const { answers, currentIndex, status } = attempt;
    const currentTask = trainingSet.tasks[currentIndex];
    const currentAnswer = currentTask
        ? answers.find((answer) => answer.taskId === currentTask.id)
        : undefined;
    const progress = calculateProgress(trainingSet, answers);
    const unansweredTasks = trainingSet.tasks.filter(
        (task) => !isAnswered(answers.find((answer) => answer.taskId === task.id)),
    );

    useEffect(() => {
        let storedDraft: string | null;
        try {
            storedDraft = window.localStorage.getItem(draftStorageKey);
        } catch {
            setStorageWarning("Хранилище недоступно. Ответы останутся только в этой вкладке.");
            setIsHydrated(true);
            return;
        }

        if (storedDraft !== null) {
            let parsedDraft: unknown;
            try {
                parsedDraft = JSON.parse(storedDraft);
            } catch {
                setDraftIssue("Черновик повреждён: не удалось прочитать JSON.");
                setIsHydrated(true);
                return;
            }

            const validation = validateDraft(parsedDraft);
            if (!validation.valid) {
                setDraftIssue(validation.message);
                setIsHydrated(true);
                return;
            }

            dispatch({ type: "restored", draft: validation.draft });
        }

        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated || draftIssue !== null) {
            return;
        }

        const draft: Draft = {
            version: 1,
            setId: trainingSet.id,
            taskId: currentTask?.id ?? "",
            answers,
            status,
        };

        try {
            window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
            setStorageWarning(null);
        } catch {
            setStorageWarning("Черновик не сохранён: хранилище недоступно. Ввод продолжается.");
        }
    }, [answers, currentTask, draftIssue, isHydrated, status]);

    function finishAttempt() {
        const missingTasks = unansweredTasks.map((task) => {
            const index = trainingSet.tasks.indexOf(task);
            return `${index + 1} (${task.id})`;
        });
        const message =
            missingTasks.length > 0
                ? `Без ответа остались задания: ${missingTasks.join(", ")}. Завершить попытку?`
                : "Завершить попытку?";

        if (window.confirm(message)) {
            dispatch({ type: "submitted" });
        }
    }

    function restartAttempt() {
        if (window.confirm("Начать новую попытку? Ответы текущей попытки будут очищены.")) {
            dispatch({ type: "reset" });
        }
    }

    function resetInvalidDraft() {
        try {
            window.localStorage.removeItem(draftStorageKey);
            setStorageWarning(null);
        } catch {
            setStorageWarning("Хранилище недоступно. Попытка продолжится без сохранения черновика.");
        }
        setDraftIssue(null);
        dispatch({ type: "reset" });
    }

    return (
        <main className="app-shell">
            <header className="page-header">
                <a className="brand" href="#main" aria-label="Тренажёр — к содержимому">
                    <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
                    <span>Тренажёр</span>
                </a>
                <span className="header-note">Практика веб-разработки</span>
            </header>

            <section className="intro" id="main" aria-labelledby="set-title">
                <div className="intro-copy">
                    <p className="eyebrow">Локальная тренировка</p>
                    <h1 id="set-title">{trainingSet.title}</h1>
                    <p className="intro-description">
                        Ответы остаются в этой попытке и не отправляются на сервер.
                    </p>
                </div>
                <div className="count-card" aria-label={`Прогресс: ${progress.answered} из ${progress.total}`}>
                    <span className="count-value">{progress.answered}/{progress.total}</span>
                    <span className="count-label">заполнено</span>
                </div>
            </section>

            {draftIssue !== null && (
                <section className="draft-notice draft-notice-error" role="alert">
                    <p>{draftIssue} Данные не восстановлены.</p>
                    <button className="primary-button" onClick={resetInvalidDraft} type="button">
                        Сбросить черновик
                    </button>
                </section>
            )}
            {storageWarning !== null && (
                <p className="draft-notice" role="status">{storageWarning}</p>
            )}

            {status === "submitted" ? (
                <SubmittedOverview answers={answers} onRestart={restartAttempt} />
            ) : (
                <>
                    <section className="progress-section" aria-label="Прогресс попытки">
                        <div className="progress-copy">
                            <span>Прогресс</span>
                            <span>{progress.answered} из {progress.total} ответов</span>
                        </div>
                        <progress
                            aria-label="Заполненные задания"
                            max={progress.total || 1}
                            value={progress.answered}
                        />
                    </section>

                    <div className="workspace">
                        <section className="catalog-panel" aria-labelledby="catalog-title">
                            <div className="section-heading">
                                <h2 id="catalog-title">Задания</h2>
                                <span>{trainingSet.tasks.length}</span>
                            </div>
                            <TaskList
                                answers={answers}
                                currentIndex={currentIndex}
                                onChoose={(index) => dispatch({ type: "moved", index })}
                                tasks={trainingSet.tasks}
                            />
                        </section>

                        <section
                            className="detail-panel"
                            aria-label="Текущее задание"
                            aria-live="polite"
                        >
                            {currentTask ? (
                                <>
                                    <p className="question-count">
                                        Задание {currentIndex + 1} из {trainingSet.tasks.length}
                                    </p>
                                    <TaskForm
                                        answer={currentAnswer}
                                        onAnswerChange={(answer) =>
                                            dispatch({ type: "answerChanged", answer })
                                        }
                                        task={currentTask}
                                    />
                                    <div className="task-navigation">
                                        <button
                                            disabled={currentIndex === 0}
                                            onClick={() =>
                                                dispatch({
                                                    type: "moved",
                                                    index: currentIndex - 1,
                                                })
                                            }
                                            type="button"
                                        >
                                            Назад
                                        </button>
                                        <button
                                            disabled={currentIndex === trainingSet.tasks.length - 1}
                                            onClick={() =>
                                                dispatch({
                                                    type: "moved",
                                                    index: currentIndex + 1,
                                                })
                                            }
                                            type="button"
                                        >
                                            {isAnswered(currentAnswer)
                                                ? "Далее"
                                                : "Пропустить задание"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <h2>В этом наборе пока нет заданий</h2>
                                </div>
                            )}
                        </section>
                    </div>

                    {unansweredTasks.length > 0 && (
                        <section className="skipped-section" aria-labelledby="skipped-title">
                            <h2 id="skipped-title">Незаполненные задания</h2>
                            <ul>
                                {unansweredTasks.map((task) => {
                                    const index = trainingSet.tasks.indexOf(task);
                                    return (
                                        <li key={task.id}>
                                            <button
                                                onClick={() =>
                                                    dispatch({ type: "moved", index })
                                                }
                                                type="button"
                                            >
                                                Задание {index + 1}: {task.topic}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    <div className="finish-actions">
                        <button className="primary-button" onClick={finishAttempt} type="button">
                            Завершить попытку
                        </button>
                    </div>
                </>
            )}

            <footer className="page-footer">
                <span>Обучение через практику</span>
                <span>Локальная попытка · без оценивания</span>
            </footer>
        </main>
    );
}
