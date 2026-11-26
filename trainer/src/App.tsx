import { useEffect, useReducer, useState } from "react";
import type { Answer, TrainingSet } from "./domain";
import { countProgress, findTaskById, isAnswerFilled } from "./domain";
import {
  attemptReducer,
  createAttempt,
  findAnswer,
  getSyncStatus,
  getUnfilledTasks,
  getUnsavedTaskIds,
  isTaskAnswered,
} from "./attempt";
import type { SyncStatus } from "./attempt";
import type { Result, ServerAttempt } from "./server-model";
import {
  deleteAnswer,
  fetchAttempt,
  fetchResult,
  loadModule,
  saveAnswer,
  setDemoFail,
  startAttempt,
  submitServerAttempt,
} from "./api/trainerApi";
import { clearSavedAttemptId, readSavedAttemptId, saveAttemptId } from "./storage";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { AttemptReview } from "./components/AttemptReview";

type Boot =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" };

type View = "task" | "overview";

type ActionError = { taskId: string | null; message: string };

const initialAttempt = createAttempt();

export default function App() {
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [set, setSet] = useState<TrainingSet | null>(null);
  const [confirmed, setConfirmed] = useState<ServerAttempt | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [attempt, dispatch] = useReducer(attemptReducer, initialAttempt);

  const [selectedId, setSelectedId] = useState<string>("");
  const [view, setView] = useState<View>("task");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [failDemo, setFailDemo] = useState(false);

  useEffect(() => {
    void loadAll();
  }, []);

  async function restoreAttempt(restored: ServerAttempt): Promise<string | null> {
    setConfirmed(restored);
    dispatch({
      type: "load",
      attempt: { status: restored.status, answers: restored.answers },
    });
    if (restored.status === "submitted") {
      const fetched = await fetchResult(restored.id);
      if (!fetched.ok) return fetched.error.message;
      setResult(fetched.data);
    }
    return null;
  }

  async function loadAll() {
    setBoot({ status: "loading" });
    const loaded = await loadModule();
    if (!loaded.ok) {
      setBoot({ status: "error", message: loaded.error.message });
      return;
    }
    setSet(loaded.data);
    setSelectedId(loaded.data.tasks[0]?.id ?? "");

    const savedId = readSavedAttemptId();
    if (savedId !== null) {
      const restored = await fetchAttempt(savedId);
      if (restored.ok) {
        const problem = await restoreAttempt(restored.data);
        if (problem !== null) {
          setBoot({ status: "error", message: problem });
          return;
        }
      } else if (restored.error.kind === "http" && restored.error.status === 404) {
        clearSavedAttemptId();
        setNotice(
          "Сервер не нашёл сохранённую попытку (возможно, он перезапускался). " +
            "Подтверждённую попытку восстановить нельзя, начните новую.",
        );
      } else {
        setBoot({ status: "error", message: restored.error.message });
        return;
      }
    }
    setBoot({ status: "ready" });
  }


  async function handleStart() {
    if (set === null || busy) return;
    setBusy(true);
    setActionError(null);
    const started = await startAttempt(set.id);
    setBusy(false);
    if (!started.ok) {
      setActionError({ taskId: null, message: started.error.message });
      return;
    }
    saveAttemptId(started.data.id);
    setConfirmed(started.data);
    setResult(null);
    setNotice(null);
    dispatch({
      type: "load",
      attempt: { status: started.data.status, answers: started.data.answers },
    });
    setSelectedId(set.tasks[0]?.id ?? "");
    setView("task");
  }

  function handleAnswer(answer: Answer) {
    dispatch({ type: "set-answer", answer });
  }

  async function handleSave(taskId: string) {
    if (confirmed === null || busy) return;
    const answer = findAnswer(attempt.answers, taskId);
    if (answer === undefined || !isAnswerFilled(answer)) return;
    setBusy(true);
    setActionError(null);
    const saved = await saveAnswer(confirmed.id, answer);
    setBusy(false);
    if (!saved.ok) {
      setActionError({ taskId, message: saved.error.message });
      return;
    }
    setConfirmed(saved.data);
  }

  async function handleClear(taskId: string) {
    if (confirmed === null || busy) return;
    setActionError(null);
    if (findAnswer(confirmed.answers, taskId) !== undefined) {
      setBusy(true);
      const deleted = await deleteAnswer(confirmed.id, taskId);
      setBusy(false);
      if (!deleted.ok) {
        setActionError({ taskId, message: deleted.error.message });
        return;
      }
      setConfirmed(deleted.data);
    }
    dispatch({ type: "clear-answer", taskId });
  }

  async function handleFinish() {
    if (set === null || confirmed === null || busy) return;
    const unsaved = getUnsavedTaskIds(set, attempt.answers, confirmed.answers);
    if (unsaved.length > 0) {
      setActionError({
        taskId: null,
        message: `Есть несохранённые ответы: ${unsaved.join(", ")}. Сохраните или очистите их перед отправкой.`,
      });
      return;
    }
    const unfilled = getUnfilledTasks(set, attempt.answers);
    if (unfilled.length > 0) {
      const ids = unfilled.map((task) => task.id).join(", ");
      const confirmedByUser = window.confirm(
        `Не заполнены задания: ${ids}. Всё равно завершить попытку?`,
      );
      if (!confirmedByUser) return;
    }
    setBusy(true);
    setActionError(null);
    const submitted = await submitServerAttempt(confirmed.id);
    setBusy(false);
    if (!submitted.ok) {
      setActionError({ taskId: null, message: submitted.error.message });
      return;
    }
    setResult(submitted.data);
    setConfirmed({ ...confirmed, status: "submitted" });
    dispatch({ type: "submit" });
  }


  const answers = attempt.answers;
  const confirmedAnswers = confirmed === null ? [] : confirmed.answers;

  function syncOf(taskId: string): SyncStatus {
    return getSyncStatus(
      findAnswer(answers, taskId),
      findAnswer(confirmedAnswers, taskId),
    );
  }

  function canClearTask(taskId: string): boolean {
    return (
      isTaskAnswered(answers, taskId) ||
      findAnswer(confirmedAnswers, taskId) !== undefined
    );
  }


  function renderReady(readySet: TrainingSet) {
    const tasks = readySet.tasks;
    const noticeLine =
      notice !== null ? <p className="notice">{notice}</p> : null;
    const errorLine =
      actionError !== null && (actionError.taskId === null || view === "overview") ? (
        <p role="alert" className="error">
          {actionError.message}
        </p>
      ) : null;

    if (tasks.length === 0) {
      return <p>В модуле пока нет заданий.</p>;
    }

    if (confirmed === null) {
      return (
        <>
          {noticeLine}
          <button type="button" disabled={busy} onClick={() => void handleStart()}>
            Начать попытку
          </button>
          {errorLine}
        </>
      );
    }

    if (attempt.status === "submitted") {
      return (
        <>
          <AttemptReview
            set={readySet}
            answers={answers}
            result={result}
            editable={false}
            busy={busy}
            canClear={canClearTask}
            onClear={(taskId) => void handleClear(taskId)}
          />
          <button
            type="button"
            className="finish"
            disabled={busy}
            onClick={() => void handleStart()}
          >
            Начать новую попытку
          </button>
          {errorLine}
        </>
      );
    }

    const progress = countProgress(readySet, answers);
    const savedProgress = countProgress(readySet, confirmedAnswers);
    const unfilled = getUnfilledTasks(readySet, answers);
    const selected = findTaskById(readySet, selectedId);
    const index = tasks.findIndex((task) => task.id === selectedId);
    const prevTask = index > 0 ? tasks[index - 1] : undefined;
    const nextTask = index >= 0 ? tasks[index + 1] : undefined;

    return (
      <>
        {noticeLine}
        <p>
          Заполнено: {progress.answered} из {progress.total}. Сохранено на сервере:{" "}
          {savedProgress.answered}.
        </p>
        <p>
          {unfilled.length === 0
            ? "Все задания заполнены."
            : `Не заполнены: ${unfilled.map((task) => task.id).join(", ")}`}
        </p>
        <p className="legend">✓ сохранено на сервере, ✎ не сохранено</p>
        <button
          type="button"
          className="view-toggle"
          onClick={() => setView(view === "task" ? "overview" : "task")}
        >
          {view === "task" ? "Обзор ответов" : "Вернуться к заданиям"}
        </button>
        {view === "overview" ? (
          <AttemptReview
            set={readySet}
            answers={answers}
            result={null}
            editable={true}
            busy={busy}
            canClear={canClearTask}
            onClear={(taskId) => void handleClear(taskId)}
          />
        ) : (
          <div className="layout">
            <TaskList
              tasks={tasks}
              selectedId={selectedId}
              syncOf={syncOf}
              onSelect={setSelectedId}
            />
            <div className="task-column">
              {selected ? (
                <TaskCard
                  task={selected}
                  answer={findAnswer(answers, selected.id)}
                  sync={syncOf(selected.id)}
                  canClear={canClearTask(selected.id)}
                  busy={busy}
                  error={
                    actionError !== null && actionError.taskId === selected.id
                      ? actionError.message
                      : null
                  }
                  onAnswer={handleAnswer}
                  onSave={() => void handleSave(selected.id)}
                  onClear={() => void handleClear(selected.id)}
                />
              ) : (
                <p>Задание не выбрано.</p>
              )}
              <div className="nav">
                <button
                  type="button"
                  disabled={prevTask === undefined}
                  onClick={() => prevTask && setSelectedId(prevTask.id)}
                >
                  Назад
                </button>
                <button
                  type="button"
                  disabled={nextTask === undefined}
                  onClick={() => nextTask && setSelectedId(nextTask.id)}
                >
                  Далее
                </button>
              </div>
            </div>
          </div>
        )}
        {errorLine}
        <button
          type="button"
          className="finish"
          disabled={busy}
          onClick={() => void handleFinish()}
        >
          {busy ? "Отправка запроса…" : "Завершить попытку"}
        </button>
      </>
    );
  }

  return (
    <main>
      <h1>
        {set !== null ? `${set.title} (заданий: ${set.tasks.length})` : "Тренажёр"}
      </h1>
      <label className="demo-fail">
        <input
          type="checkbox"
          checked={failDemo}
          onChange={(event) => {
            setDemoFail(event.target.checked);
            setFailDemo(event.target.checked);
          }}
        />{" "}
        Демо: имитировать ошибку сервера (заголовок X-Demo-Fail)
      </label>
      {boot.status === "loading" && <p>Загрузка с сервера…</p>}
      {boot.status === "error" && (
        <div role="alert" className="error">
          <p>Не удалось загрузить данные: {boot.message}</p>
          <button type="button" onClick={() => void loadAll()}>
            Повторить
          </button>
        </div>
      )}
      {boot.status === "ready" && set !== null && renderReady(set)}
    </main>
  );
}