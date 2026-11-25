import { useCallback, useEffect, useReducer, useState } from "react";
import type { ReactNode } from "react";
import type { Answer, Task, TrainingSet } from "./domain.js";
import type { AttemptResult, RequestState, SetSummary } from "./api.js";
import { ApiError, api } from "./api.js";
import { attemptReducer, createInitialAttempt } from "./reducer.js";
import { clearAttemptRef, readAttemptRef, writeAttemptRef } from "./storage.js";
import type { SaveState } from "./types.js";
import { IDLE_SAVE, isAnswered } from "./types.js";
import { ErrorBanner } from "./components/ErrorBanner.js";
import { TaskList } from "./components/TaskList.js";
import { TaskCard } from "./components/TaskCard.js";
import { AttemptReview } from "./components/AttemptReview.js";

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Неизвестная ошибка";
}

export function App() {
  const [setsState, setSetsState] = useState<RequestState<SetSummary[]>>({
    status: "idle",
  });
  const [setState, setSetState] = useState<RequestState<TrainingSet>>({
    status: "idle",
  });
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptCreating, setAttemptCreating] = useState(false);
  const [attemptError, setAttemptError] = useState<string | null>(null);

  const [attempt, dispatch] = useReducer(
    attemptReducer,
    undefined,
    createInitialAttempt,
  );
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [submitRequest, setSubmitRequest] = useState<{
    status: "idle" | "loading" | "error";
    message?: string;
    canRetry?: boolean;
  }>({ status: "idle" });
  const [resultState, setResultState] = useState<RequestState<AttemptResult>>({
    status: "idle",
  });
  const [failNext, setFailNext] = useState(false);

  const currentSet = setState.status === "success" ? setState.data : null;
  const tasks = currentSet?.tasks ?? [];
  const currentTask =
    attempt.status === "in-progress" ? tasks[attempt.currentIndex] : undefined;
  const currentAnswer = currentTask
    ? attempt.answers.find((a) => a.taskId === currentTask.id)
    : undefined;
  const currentSave: SaveState =
    currentTask !== undefined
      ? (saveStates[currentTask.id] ?? IDLE_SAVE)
      : IDLE_SAVE;

  const answeredCount = tasks.reduce(
    (count, task) =>
      count +
      (isAnswered(attempt.answers.find((a) => a.taskId === task.id)) ? 1 : 0),
    0,
  );
  const unansweredTasks = tasks.filter(
    (task) => !isAnswered(attempt.answers.find((a) => a.taskId === task.id)),
  );

  // --- Загрузки ---
  const loadSetsFlow = useCallback(async () => {
    setSetsState({ status: "loading" });
    try {
      setSetsState({ status: "success", data: await api.loadSets() });
    } catch (e) {
      setSetsState({ status: "error", message: errorMessage(e) });
    }
  }, []);

  // Монтирование: список наборов + восстановление попытки
  useEffect(() => {
    let cancelled = false;
    void loadSetsFlow();

    const ref = readAttemptRef();
    if (ref !== null) {
      setAttemptId(ref.attemptId);
      void (async () => {
        setResultState({ status: "loading" });
        try {
          const serverAttempt = await api.loadAttempt(ref.attemptId);
          if (cancelled) return;
          const loadedSet = await api.loadSet(serverAttempt.setId);
          if (cancelled) return;

          setSetState({ status: "success", data: loadedSet });
          dispatch({ type: "reset" });

          const restoredSaves: Record<string, SaveState> = {};
          for (const ans of serverAttempt.answers) {
            dispatch({ type: "answerChanged", answer: ans });
            restoredSaves[ans.taskId] = {
              status: "saved",
              message: "Восстановлено с сервера",
            };
          }
          setSaveStates(restoredSaves);

          if (serverAttempt.status === "submitted") {
            const res = await api.loadResult(serverAttempt.id);
            if (cancelled) return;
            dispatch({ type: "submitted" });
            setResultState({ status: "success", data: res });
          } else {
            setResultState({ status: "idle" });
          }
        } catch (e) {
          if (cancelled) return;
          if (e instanceof ApiError && e.status === 404) {
            clearAttemptRef();
            setAttemptId(null);
          }
          setResultState({
            status: "error",
            message: `${errorMessage(e)} — сохранённая попытка недоступна`,
          });
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [loadSetsFlow]);
  // --- Обработчики ---
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const handleSelectSet = async (id: string) => {
    setSelectedSetId(id);
    setSetState({ status: "loading" });
    setAttemptId(null);
    setAttemptError(null);
    dispatch({ type: "reset" });
    setSaveStates({});
    try {
      setSetState({ status: "success", data: await api.loadSet(id) });
    } catch (e) {
      setSetState({ status: "error", message: errorMessage(e) });
    }
  };

  const handleStartAttempt = async () => {
    if (currentSet === null) return;
    setAttemptCreating(true);
    setAttemptError(null);
    try {
      const created = await api.createAttempt(currentSet.id);
      writeAttemptRef({ setId: currentSet.id, attemptId: created.id });
      dispatch({ type: "reset" });
      setSaveStates({});
      setSubmitRequest({ status: "idle" });
      setAttemptId(created.id);
    } catch (e) {
      setAttemptError(errorMessage(e));
    } finally {
      setAttemptCreating(false);
    }
  };

  const handleAnswerChange = (answer: Answer) => {
    dispatch({ type: "answerChanged", answer });
    setSaveStates((s) => ({ ...s, [answer.taskId]: IDLE_SAVE }));
  };

  const consumeFail = (): boolean => {
    const value = failNext;
    setFailNext(false);
    return value;
  };

  const handleSave = async (task: Task) => {
    if (attemptId === null) return;
    const answer = attempt.answers.find((a) => a.taskId === task.id);
    if (answer === undefined) return;
    const fail = consumeFail();
    setSaveStates((s) => ({ ...s, [task.id]: { status: "saving" } }));
    try {
      await api.saveAnswer(attemptId, answer, fail);
      setSaveStates((s) => ({
        ...s,
        [task.id]: {
          status: "saved",
          message: "Сервер подтвердил сохранение (PUT)",
        },
      }));
    } catch (e) {
      setSaveStates((s) => ({
        ...s,
        [task.id]: { status: "error", message: errorMessage(e) },
      }));
    }
  };

  const handleClear = async (task: Task) => {
    if (attemptId === null) return;
    const fail = consumeFail();
    setSaveStates((s) => ({ ...s, [task.id]: { status: "saving" } }));
    try {
      await api.clearAnswer(attemptId, task.id, fail);
      dispatch({ type: "answerRemoved", taskId: task.id });
      setSaveStates((s) => ({
        ...s,
        [task.id]: {
          status: "saved",
          message: "Сервер очистил ответ (DELETE)",
        },
      }));
    } catch (e) {
      setSaveStates((s) => ({
        ...s,
        [task.id]: { status: "error", message: errorMessage(e) },
      }));
    }
  };

  const handleSubmit = async () => {
    if (attemptId === null || currentSet === null) return;
    const fail = consumeFail();
    setSubmitRequest({ status: "loading" });
    try {
      let data: AttemptResult;
      try {
        data = await api.submit(attemptId, fail);
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          data = await api.loadResult(attemptId);
        } else {
          throw e;
        }
      }
      writeAttemptRef({ setId: currentSet.id, attemptId });
      dispatch({ type: "submitted" });
      setResultState({ status: "success", data });
      setSubmitRequest({ status: "idle" });
    } catch (e) {
      setSubmitRequest({
        status: "error",
        message: errorMessage(e),
        canRetry: true,
      });
    }
  };

  const handleFinishClick = () => {
    if (unansweredTasks.length > 0) {
      const ok = window.confirm(
        `Не заполнены задания: ${unansweredTasks.map((t) => t.id).join(", ")}.\n` +
          "Пропущенные ответы получат 0 баллов. Всё равно завершить попытку?",
      );
      if (!ok) return;
    }
    void handleSubmit();
  };

  const handleRestart = () => {
    clearAttemptRef();
    setResultState({ status: "idle" });
    setAttemptId(null);
    setSubmitRequest({ status: "idle" });
    setSaveStates({});
    dispatch({ type: "reset" });
  };
  // --- Выбор экрана ---
  let content: ReactNode;
  if (resultState.status === "loading") {
    content = <p className="screen-note">Загрузка сохранённой попытки…</p>;
  } else if (resultState.status === "success") {
    content = (
      <AttemptReview
        tasks={tasks}
        answers={attempt.answers}
        result={resultState.data}
        onRestart={handleRestart}
      />
    );
  } else if (attemptId !== null && currentSet !== null) {
    content = (
      <div className="app-layout">
        <TaskList
          tasks={tasks}
          answers={attempt.answers}
          saveStates={saveStates}
          currentIndex={attempt.currentIndex}
          onSelect={(index) => dispatch({ type: "moved", index })}
        />
        <div className="app-main">
          {currentTask !== undefined ? (
            <>
              <TaskCard
                task={currentTask}
                answer={currentAnswer}
                onChange={handleAnswerChange}
              />
              <div className="save-row">
                <button
                  type="button"
                  className="nav-button"
                  disabled={
                    currentAnswer === undefined ||
                    currentSave.status === "saving" ||
                    submitRequest.status === "loading"
                  }
                  onClick={() => void handleSave(currentTask)}
                >
                  Сохранить ответ
                </button>
                <button
                  type="button"
                  className="nav-button"
                  disabled={
                    (currentAnswer === undefined && currentSave.status !== "error") ||
                    currentSave.status === "saving" ||
                    submitRequest.status === "loading"
                  }
                  onClick={() => void handleClear(currentTask)}
                >
                  Очистить
                </button>
                <span className={`save-status save-${currentSave.status}`}>
                  {currentSave.status === "saving" && "Сохранение…"}
                  {currentSave.status === "saved" &&
                    `✓ ${currentSave.message ?? ""}`}
                  {currentSave.status === "error" &&
                    `⚠ ${currentSave.message ?? ""}`}
                </span>
                {currentSave.status === "error" && (
                  <button
                    type="button"
                    className="error-button"
                    onClick={() => void handleSave(currentTask)}
                  >
                    Повторить
                  </button>
                )}
              </div>
              <nav className="navigation" aria-label="Навигация по заданиям">
                <button
                  type="button"
                  className="nav-button"
                  disabled={attempt.currentIndex === 0}
                  onClick={() =>
                    dispatch({
                      type: "moved",
                      index: Math.max(attempt.currentIndex - 1, 0),
                    })
                  }
                >
                  ← Назад
                </button>
                <span className="nav-counter">
                  {attempt.currentIndex + 1} / {tasks.length} · заполнено{" "}
                  {answeredCount}
                </span>
                {attempt.currentIndex === tasks.length - 1 ? (
                  <button
                    type="button"
                    className="nav-button nav-button-finish"
                    disabled={submitRequest.status === "loading"}
                    onClick={handleFinishClick}
                  >
                    {submitRequest.status === "loading"
                      ? "Отправка…"
                      : "Завершить"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() =>
                      dispatch({
                        type: "moved",
                        index: Math.min(
                          attempt.currentIndex + 1,
                          tasks.length - 1,
                        ),
                      })
                    }
                  >
                    Далее →
                  </button>
                )}
              </nav>
              {submitRequest.status === "error" && (
                <ErrorBanner
                  message={`Завершение не выполнено: ${submitRequest.message ?? ""}`}
                  onRetry={
                    submitRequest.canRetry
                      ? () => void handleSubmit()
                      : undefined
                  }
                  onDismiss={() => setSubmitRequest({ status: "idle" })}
                />
              )}
              <label className="fail-row">
                <input
                  type="checkbox"
                  checked={failNext}
                  onChange={(e) => setFailNext(e.target.checked)}
                />
                Симулировать ошибку сервера: следующий запрос с X-Demo-Fail: 1
              </label>
            </>
          ) : (
            <p className="screen-note">Задание не найдено.</p>
          )}
        </div>
      </div>
    );
  } else if (currentSet !== null) {
    content = (
      <div className="set-preview">
        <h2>{currentSet.title}</h2>
        <p>Заданий: {currentSet.tasks.length}</p>
        {attemptError !== null && (
          <ErrorBanner
            message={`Не удалось создать попытку: ${attemptError}`}
            onRetry={() => void handleStartAttempt()}
          />
        )}
        <button
          type="button"
          className="review-restart"
          disabled={attemptCreating}
          onClick={() => void handleStartAttempt()}
        >
          {attemptCreating ? "Создание…" : "Начать попытку"}
        </button>
      </div>
    );
  } else if (setState.status === "loading") {
    content = <p className="screen-note">Загрузка набора…</p>;
  } else if (setState.status === "error") {
    content = (
      <ErrorBanner
        message={`Не удалось загрузить набор: ${setState.message}`}
        onRetry={() => {
          if (selectedSetId !== null) void handleSelectSet(selectedSetId);
        }}
      />
    );
  } else if (setsState.status === "loading" || setsState.status === "idle") {
    content = <p className="screen-note">Загрузка списка наборов…</p>;
  } else if (setsState.status === "error") {
    content = (
      <ErrorBanner
        message={`Не удалось загрузить список наборов: ${setsState.message}`}
        onRetry={() => void loadSetsFlow()}
      />
    );
  } else {
    content = (
      <div className="set-preview">
        <h2>Наборы с сервера</h2>
        <ul className="set-list">
          {setsState.data.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="nav-button"
                onClick={() => void handleSelectSet(s.id)}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="module-header">
        <h1 className="module-title">{currentSet?.title ?? "Тренажёр"}</h1>
        <p className="module-count">
          {attemptId !== null ? `Попытка: ${attemptId}` : "Попытка не создана"}
        </p>
      </header>
      {resultState.status === "error" && (
        <ErrorBanner
          message={resultState.message}
          onDismiss={() => setResultState({ status: "idle" })}
        />
      )}
      {content}
    </div>
  );
}
