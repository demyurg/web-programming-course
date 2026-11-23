import { useEffect, useReducer, useRef, useState } from "react";
import type { Answer, TrainingSet } from "./domain";
import { calculateProgress, isAnswered } from "./domain";
import { attemptReducer, initialAttemptState } from "./attempt";
import { AttemptReview } from "./AttemptReview";
import { ResultView } from "./ResultView";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import { trainingSet } from "./trainingSet";
import {
    ApiError, createAttempt, deleteAnswer, getAttempt, getResult, getSet, putAnswer, submitAttempt,
    type ServerAttempt, type ServerResult,
} from "./trainerApi";

const ATTEMPT_KEY = `trainer:attemptId:${trainingSet.id}`;

export function App() {
    const [module, setModule] = useState<TrainingSet | null>(null);
    const [serverAttempt, setServerAttempt] = useState<ServerAttempt | null>(null);
    const [result, setResult] = useState<ServerResult | null>(null);
    const [state, dispatch] = useReducer(attemptReducer, initialAttemptState);
    const [phase, setPhase] = useState<"loading" | "ready">("loading");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [retry, setRetry] = useState<(() => Promise<void>) | null>(null);
    const [demoFailure, setDemoFailure] = useState(false);
    const started = useRef(false);

    async function run(operation: () => Promise<void>) {
        setBusy(true);
        setError(null);
        try {
            await operation();
            setRetry(null);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Неизвестная ошибка запроса.");
            setRetry(() => operation);
        } finally {
            setBusy(false);
            setPhase("ready");
        }
    }

    function showAttempt(attempt: ServerAttempt, taskId: string) {
        setServerAttempt(attempt);
        dispatch({ type: "restored", draft: {
            version: 1, setId: attempt.setId, taskId,
            answers: attempt.answers, status: attempt.status,
        } });
    }

    async function load() {
        const loaded = await getSet(trainingSet.id);
        setModule(loaded);
        dispatch({ type: "setLoaded", tasks: loaded.tasks });
        let id: string | null = null;
        try {
            id = window.localStorage.getItem(ATTEMPT_KEY);
        } catch {
            setNotice("Хранилище недоступно. После перезагрузки потребуется новая попытка.");
        }
        if (!id) {
            setNotice("Нет сохранённого attemptId. Создайте попытку, чтобы отправлять ответы серверу.");
            return;
        }
        let attempt: ServerAttempt;
        try {
            attempt = await getAttempt(id);
        } catch (reason) {
            if (reason instanceof ApiError && reason.status === 404) {
                try { window.localStorage.removeItem(ATTEMPT_KEY); } catch { /* хранилище может быть недоступно */ }
                setNotice("Сервер больше не знает эту попытку. Восстановить подтверждённые ответы нельзя; создайте новую.");
                return;
            }
            throw reason;
        }
        if (attempt.setId !== loaded.id) throw new Error("Попытка относится к другому модулю.");
        showAttempt(attempt, loaded.tasks[0]?.id ?? "");
        setNotice("Попытка и подтверждённые ответы загружены с сервера.");
        if (attempt.status === "submitted") setResult(await getResult(attempt.id));
    }

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        void run(load);
    }, []);

    async function start() {
        if (!module) return;
        await run(async () => {
            const attempt = await createAttempt(module.id);
            showAttempt(attempt, module.tasks[0]?.id ?? "");
            setResult(null);
            setNotice("Попытка создана на сервере.");
            try {
                window.localStorage.setItem(ATTEMPT_KEY, attempt.id);
            } catch {
                setNotice("Попытка создана, но attemptId не сохранился в браузере. После перезагрузки восстановление не сработает.");
            }
        });
    }

    const tasks = module?.tasks ?? [];
    const { answers, currentIndex, status, confirming } = state;
    const currentTask = tasks[currentIndex];
    const currentAnswer = answers.find((answer) => answer.taskId === currentTask?.id);
    const confirmedAnswer = serverAttempt?.answers.find((answer) => answer.taskId === currentTask?.id);
    const currentDirty = JSON.stringify(currentAnswer) !== JSON.stringify(confirmedAnswer);
    const hasUnsaved = tasks.some((task) =>
        JSON.stringify(answers.find((answer) => answer.taskId === task.id)) !==
        JSON.stringify(serverAttempt?.answers.find((answer) => answer.taskId === task.id))
    );
    const progress = module ? calculateProgress(module, answers) : { answered: 0, total: 0 };
    const unanswered = tasks.filter((task) => !isAnswered(task, answers.find((answer) => answer.taskId === task.id)));
    const unansweredIds = new Set(unanswered.map((task) => task.id));

    function clearAnswer(taskId: string) {
        if (!serverAttempt) return;
        dispatch({ type: "answerCleared", taskId });
        const id = serverAttempt.id;
        void run(async () => {
            const confirmed = await deleteAnswer(id, taskId);
            showAttempt(confirmed, currentTask?.id ?? tasks[0]?.id ?? "");
            setNotice(`Сервер подтвердил очистку ответа ${taskId}.`);
        });
    }

    function changeAnswer(answer: Answer) {
        setError(null);
        setRetry(null);
        dispatch({ type: "answerChanged", answer });
    }

    function saveAnswer(answer: Answer) {
        if (!serverAttempt) return;
        const id = serverAttempt.id;
        let failOnce = demoFailure;
        setDemoFailure(false);
        void run(async () => {
            const injectFailure = failOnce;
            failOnce = false;
            const confirmed = await putAnswer(id, answer, injectFailure);
            showAttempt(confirmed, currentTask?.id ?? tasks[0]?.id ?? "");
            setNotice(`Сервер подтвердил ответ ${answer.taskId}.`);
        });
    }

    function finish() {
        if (!serverAttempt) return;
        const id = serverAttempt.id;
        void run(async () => {
            const received = await submitAttempt(id);
            setResult(received);
            setServerAttempt({ ...serverAttempt, status: "submitted" });
            dispatch({ type: "submitted" });
            setNotice("Сервер подтвердил завершение попытки.");
        });
    }

    return (
        <main>
            <h1>{module?.title ?? "Тренажёр веб-программирования"}</h1>
            {phase === "loading" && <p>Загрузка модуля и попытки с сервера…</p>}
            {notice && <p role="status">{notice}</p>}
            {error && <section className="storage-warning" role="alert">
                <p>Ошибка: {error} Локальный ввод остался на экране; сервер его не подтвердил.</p>
                {retry && <button type="button" disabled={busy} onClick={() => void run(retry)}>Повторить запрос</button>}
            </section>}
            {busy && <p role="status">Идёт запрос к серверу…</p>}
            {phase === "ready" && module && !serverAttempt && (
                <button type="button" disabled={busy} onClick={() => void start()}>Создать попытку</button>
            )}
            {module && serverAttempt && <>
                <p>Количество заданий: {tasks.length}</p>
                <p aria-live="polite">Прогресс: {progress.answered} из {progress.total}</p>
                {status === "submitted" ? <>
                    <h2>Попытка завершена</h2>
                    <AttemptReview tasks={tasks} answers={answers} submitted onClear={clearAnswer} />
                    {result ? <ResultView result={result} tasks={tasks} /> :
                        <button type="button" disabled={busy} onClick={() => void run(async () => setResult(await getResult(serverAttempt.id)))}>Загрузить результат</button>}
                    <button type="button" disabled={busy} onClick={() => void start()}>Начать новую попытку</button>
                </> : <>
                    <TaskList tasks={tasks} currentId={currentTask?.id ?? ""} unansweredIds={unansweredIds}
                        onSelect={(id) => dispatch({ type: "moved", index: tasks.findIndex((task) => task.id === id) })} />
                    <section aria-label="Задания без ответа">
                        <h2>Без ответа: {unanswered.length}</h2>
                        {unanswered.length ? <ul>{unanswered.map((task) => <li key={task.id}>{task.prompt}</li>)}</ul> : <p>Все задания заполнены.</p>}
                    </section>
                    {currentTask && <>
                        <p>Задание {currentIndex + 1} из {tasks.length}</p>
                        <TaskCard task={currentTask} answer={currentAnswer} disabled={busy}
                            onAnswerChange={changeAnswer} onAnswerClear={clearAnswer} />
                        <p>{currentDirty ? "Есть изменение без подтверждения сервера." : "Ответ совпадает с подтверждённым сервером."}</p>
                        <label><input type="checkbox" checked={demoFailure} disabled={busy}
                            onChange={(event) => setDemoFailure(event.target.checked)} /> Проверить ошибку сервера при следующем сохранении</label>
                        <button type="button" disabled={busy || !currentDirty || !isAnswered(currentTask, currentAnswer)}
                            onClick={() => { if (currentAnswer) saveAnswer(currentAnswer); }}>Сохранить ответ на сервере</button>
                        <nav className="attempt-actions" aria-label="Навигация по заданиям">
                            <button type="button" disabled={currentIndex === 0 || busy} onClick={() => dispatch({ type: "moved", index: currentIndex - 1 })}>Назад</button>
                            <button type="button" disabled={currentIndex === tasks.length - 1 || busy} onClick={() => dispatch({ type: "moved", index: currentIndex + 1 })}>
                                {isAnswered(currentTask, currentAnswer) ? "Далее" : "Пропустить"}
                            </button>
                        </nav>
                    </>}
                    <AttemptReview tasks={tasks} answers={answers} submitted={false} disabled={busy} onClear={clearAnswer} />
                    {confirming ? <section className="confirmation" aria-label="Подтверждение завершения">
                        <h2>Завершить попытку?</h2>
                        <p>Без ответа: {unanswered.length}. {hasUnsaved ? "Сначала сохраните или очистите неподтверждённые ответы." : "Все локальные изменения подтверждены сервером."}</p>
                        <button type="button" disabled={busy} onClick={() => dispatch({ type: "finishCanceled" })}>Отмена</button>
                        <button type="button" disabled={busy || hasUnsaved} onClick={finish}>Подтвердить завершение</button>
                    </section> : <button type="button" disabled={busy} onClick={() => dispatch({ type: "finishRequested" })}>Завершить попытку</button>}
                </>}
            </>}
        </main>
    );
}
