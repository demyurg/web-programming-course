import { useEffect, useState } from "react";
import type {
  Answer,
  AttemptResult,
  RequestState,
  ServerAttempt,
  TrainingSet,
} from "./domain";
import { findAnswer, getUnansweredTasks, isSameAnswer } from "./attempt";
import {
  ApiError,
  createAttempt,
  deleteAnswer,
  getAttempt,
  getAttemptResult,
  getSetById,
  getSets,
  saveAnswer,
  submitAttempt,
} from "./api/trainerApi";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { AttemptReview } from "./components/AttemptReview";
import "./App.css";

const ATTEMPT_ID_KEY = "trainer_attempt_id";

function toDraftMap(answers: Answer[]): Record<string, Answer> {
  const map: Record<string, Answer> = {};
  for (const a of answers) map[a.taskId] = a;
  return map;
}

export default function App() {
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);
  const [attempt, setAttempt] = useState<ServerAttempt | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Answer>>({});

  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [demoFail, setDemoFail] = useState(false);

  const [initState, setInitState] = useState<RequestState>({ status: "loading" });
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const [actionState, setActionState] = useState<RequestState>({ status: "idle" });
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

  const isBusy = actionState.status === "loading";

  function resetActionError() {
    setActionState({ status: "idle" });
    setRetryAction(null);
  }

  async function runAction(
    fn: (useDemoFail: boolean) => Promise<void>,
    useDemoFail = demoFail,
  ) {
    setActionState({ status: "loading" });
    setRetryAction(null);
    try {
      await fn(useDemoFail);
      setActionState({ status: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка при обращении к серверу.";
      setActionState({ status: "error", message });
      setRetryAction(() => () => {
        setDemoFail(false);
        void runAction(fn, false);
      });
    }
  }

  async function loadInitialData() {
    setInitState({ status: "loading" });
    setRestoreNotice(null);

    try {
      const sets = await getSets();
      if (sets.length === 0) throw new Error("На сервере нет учебных модулей.");

      const loadedSet = await getSetById(sets[0].id);
      setTrainingSet(loadedSet);
      setSelectedTaskId((id) => id || loadedSet.tasks[0]?.id || "");

      const savedId = localStorage.getItem(ATTEMPT_ID_KEY);
      if (!savedId) {
        setRestoreNotice(
          "Сохранённого attemptId нет — восстановить подтверждённую попытку нельзя. Начните новую попытку.",
        );
        setInitState({ status: "success" });
        return;
      }

      try {
        const restored = await getAttempt(savedId);
        setAttempt(restored);
        setDrafts(toDraftMap(restored.answers));

        if (restored.status === "submitted") {
          setResult(await getAttemptResult(restored.id));
          setShowReview(true);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          localStorage.removeItem(ATTEMPT_ID_KEY);
          setAttempt(null);
          setResult(null);
          setDrafts({});
          setRestoreNotice(
            "Подтверждённую попытку не удалось восстановить: сервер её не находит. Начните новую попытку.",
          );
        } else {
          throw err;
        }
      }

      setInitState({ status: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить данные.";
      setInitState({ status: "error", message });
    }
  }

  useEffect(() => {
    void loadInitialData();
  }, []);

  function startNewAttempt() {
    if (!trainingSet) return;
    void runAction(async (fail) => {
      const created = await createAttempt(trainingSet.id, fail);
      localStorage.setItem(ATTEMPT_ID_KEY, created.id);
      setAttempt(created);
      setResult(null);
      setDrafts({});
      setRestoreNotice(null);
      setShowReview(false);
      setShowWarning(false);
      setSelectedTaskId(trainingSet.tasks[0]?.id ?? "");
    });
  }

  function handleSave(answer: Answer) {
    if (!attempt || attempt.status === "submitted") return;
    void runAction(async (fail) => {
      const updated = await saveAnswer(attempt.id, answer, fail);
      setAttempt(updated);
      const confirmed = findAnswer(updated.answers, answer.taskId);
      if (confirmed) setDrafts((prev) => ({ ...prev, [answer.taskId]: confirmed }));
    });
  }

  function handleClear(taskId: string) {
    if (!attempt || attempt.status === "submitted") return;

    if (!findAnswer(attempt.answers, taskId)) {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      return;
    }

    void runAction(async (fail) => {
      const updated = await deleteAnswer(attempt.id, taskId, fail);
      setAttempt(updated);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    });
  }

  function handleSubmit() {
    if (!attempt || attempt.status === "submitted") return;
    void runAction(async (fail) => {
      const serverResult = await submitAttempt(attempt.id, fail);
      setResult(serverResult);
      setAttempt((prev) => (prev ? { ...prev, status: "submitted" } : prev));
      setShowWarning(false);
      setShowReview(true);
    });
  }

  if (initState.status === "loading") {
    return (
      <main className="app">
        <section className="empty-state">
          <h2>Загрузка учебного модуля...</h2>
        </section>
      </main>
    );
  }

  if (initState.status === "error" || !trainingSet) {
    return (
      <main className="app">
        <section className="empty-state">
          <h2>Не удалось загрузить данные</h2>
          <p>{initState.status === "error" ? initState.message : "Модуль не найден."}</p>
          <button type="button" className="action-button primary" onClick={() => void loadInitialData()}>
            Повторить загрузку
          </button>
        </section>
      </main>
    );
  }

  const tasks = trainingSet.tasks;
  const selectedIndex = tasks.findIndex((t) => t.id === selectedTaskId);
  const selectedTask = tasks[selectedIndex] ?? tasks[0];
  const confirmedAnswers = attempt?.answers ?? [];
  const unanswered = getUnansweredTasks(tasks, confirmedAnswers);
  const missingNumbers = unanswered.map((t) => "№" + (tasks.indexOf(t) + 1)).join(", ");
  const hasUnsavedChanges = tasks.some(
    (t) => !isSameAnswer(drafts[t.id], findAnswer(confirmedAnswers, t.id)),
  );

  const errorBanner = actionState.status === "error" && (
    <div className="error-box" role="alert">
      <p>{actionState.message}</p>
      {retryAction && (
        <button type="button" className="action-button" onClick={retryAction} disabled={isBusy}>
          Повторить
        </button>
      )}
    </div>
  );

  return (
    <main className="app">
      <header className="app-header">
        <h1>{trainingSet.title}</h1>
        <p className="subtitle">
          Учебный модуль · {tasks.length} заданий
          {attempt ? ` · Попытка: ${attempt.id}` : ""}
        </p>
        <label className="demo-fail-toggle">
          <input
            type="checkbox"
            checked={demoFail}
            onChange={(e) => setDemoFail(e.target.checked)}
            disabled={isBusy}
          />
          Имитировать ошибку сервера 500 (X-Demo-Fail: 1)
        </label>
      </header>

      {!attempt ? (
        <section className="empty-state">
          <h2>Нет активной попытки</h2>
          {restoreNotice && <p className="notice-text">{restoreNotice}</p>}
          <button
            type="button"
            className="action-button primary"
            onClick={startNewAttempt}
            disabled={isBusy}
          >
            {isBusy ? "Создание попытки..." : "Начать новую попытку"}
          </button>
          {errorBanner}
        </section>
      ) : (
        <div className="workspace">
          <section className="sidebar">
            <p className="section-label">Содержание модуля</p>
            <TaskList
              tasks={tasks}
              selectedTaskId={selectedTask.id}
              confirmedAnswers={confirmedAnswers}
              onChoose={(id) => {
                setSelectedTaskId(id);
                setShowReview(false);
                resetActionError();
              }}
            />
            <div className="progress">
              <p>
                Подтверждено сервером: {tasks.length - unanswered.length} из {tasks.length}
              </p>
              <p>{unanswered.length > 0 ? `Не заполнены: ${missingNumbers}` : "Все задания подтверждены"}</p>
            </div>
          </section>

          {attempt.status === "submitted" ? (
            <div>
              <AttemptReview
                tasks={tasks}
                answers={confirmedAnswers}
                editable={false}
                isBusy={isBusy}
                result={result}
                onClear={() => {}}
              />
              <div className="actions">
                <button
                  type="button"
                  className="action-button primary"
                  onClick={startNewAttempt}
                  disabled={isBusy}
                >
                  {isBusy ? "Создание попытки..." : "Начать новую попытку"}
                </button>
              </div>
              {errorBanner}
            </div>
          ) : (
            <div>
              {showReview ? (
                <>
                  <AttemptReview
                    tasks={tasks}
                    answers={confirmedAnswers}
                    editable={true}
                    isBusy={isBusy}
                    result={null}
                    onClear={handleClear}
                  />
                  {errorBanner}
                </>
              ) : (
                <TaskCard
                  task={selectedTask}
                  draftAnswer={drafts[selectedTask.id]}
                  confirmedAnswer={findAnswer(confirmedAnswers, selectedTask.id)}
                  isBusy={isBusy}
                  actionState={actionState}
                  onChangeDraft={(answer) => {
                    setDrafts((prev) => ({ ...prev, [answer.taskId]: answer }));
                    if (actionState.status === "error") resetActionError();
                  }}
                  onSave={handleSave}
                  onClear={handleClear}
                  onRetry={retryAction}
                />
              )}

              <div className="actions">
                {showReview ? (
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setShowReview(false)}
                    disabled={isBusy}
                  >
                    Вернуться к заданиям
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => {
                        setSelectedTaskId(tasks[selectedIndex - 1].id);
                        resetActionError();
                      }}
                      disabled={selectedIndex === 0 || isBusy}
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => {
                        setSelectedTaskId(tasks[selectedIndex + 1].id);
                        resetActionError();
                      }}
                      disabled={selectedIndex === tasks.length - 1 || isBusy}
                    >
                      Далее
                    </button>
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => setShowReview(true)}
                      disabled={isBusy}
                    >
                      Обзор ответов
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="action-button finish"
                  onClick={() =>
                    unanswered.length > 0 || hasUnsavedChanges
                      ? setShowWarning(true)
                      : handleSubmit()
                  }
                  disabled={isBusy}
                >
                  {isBusy ? "Отправка..." : "Завершить попытку"}
                </button>
              </div>

              {showWarning && (
                <div className="warning" role="alert">
                  <p>
                    {unanswered.length > 0 && `Не сохранены задания: ${missingNumbers}. `}
                    {hasUnsavedChanges && "Есть несохранённые изменения. "}
                    Завершить попытку?
                  </p>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setShowWarning(false)}
                    disabled={isBusy}
                  >
                    Вернуться к заданиям
                  </button>
                  <button
                    type="button"
                    className="action-button finish"
                    onClick={handleSubmit}
                    disabled={isBusy}
                  >
                    Всё равно завершить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}