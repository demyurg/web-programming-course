import { useState, useEffect, useReducer } from "react";
import { mainSet } from "./data";
import { getProgress } from "./domain";
import {
  attemptReducer,
  createInitialAttempt,
  getUnansweredTasks,
  validateDraft,
} from "./attempt";
import TaskList from "./TaskList";
import TaskCard from "./TaskCard";
import TaskReview from "./TaskReview";

const STORAGE_KEY = `trainer-draft:${mainSet.id}`;

export default function App() {
  const [state, dispatch] = useReducer(
    attemptReducer,
    mainSet,
    createInitialAttempt
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    let raw: string | null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      setSaveError(
        "Хранилище недоступно. Ответы сохраняются только в текущей вкладке."
      );
      setIsHydrated(true);
      return;
    }

    if (raw === null) {
      setIsHydrated(true);
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setStorageError("Черновик повреждён (некорректный JSON).");
      return;
    }

    const validation = validateDraft(parsed, mainSet);
    if (!validation.ok) {
      setStorageError(validation.reason);
      return;
    }

    dispatch({ type: "restored", state: validation.state });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || storageError) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveError(null);
    } catch {
      setSaveError(
        "Запись недоступна. Ваши ответы сохраняются только в текущей вкладке."
      );
    }
  }, [state, isHydrated, storageError]);

  function handleReset() {
    setStorageError(null);
    setSaveError(null);
    setShowReview(false);
    setIsHydrated(true);
    dispatch({
      type: "reset",
      setId: mainSet.id,
      initialTaskId: mainSet.tasks[0]?.id ?? "",
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      setSaveError(
        "Не удалось очистить хранилище, но попытка сброшена в текущей вкладке."
      );
    }
  }

  if (storageError) {
    return (
      <div style={{ padding: "24px", background: "#fee2e2", borderRadius: "8px" }}>
        <h1>Ошибка загрузки черновика</h1>
        <p>{storageError}</p>
        <button
          type="button"
          onClick={handleReset}
          style={{
            background: "#c0392b",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Явный сброс (Начать новую попытку)
        </button>
      </div>
    );
  }

  if (mainSet.tasks.length === 0) {
    return <div>В модуле пока нет заданий.</div>;
  }

  const currentIndex = mainSet.tasks.findIndex((t) => t.id === state.taskId);
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  const currentTask = mainSet.tasks[safeIndex];
  const currentAnswer = state.answers.find((a) => a.taskId === currentTask.id);
  const progress = getProgress(mainSet, state.answers);
  const unansweredTasks = getUnansweredTasks(mainSet, state.answers);

  function handleFinish() {
    if (unansweredTasks.length > 0) {
      const ids = unansweredTasks.map((t) => t.id).join(", ");
      if (!window.confirm(`Вы не ответили на задания: ${ids}. Завершить попытку?`)) {
        return;
      }
    }
    setShowReview(false);
    dispatch({ type: "submitted" });
  }

  if (state.status === "submitted") {
    return (
      <div>
        <h1>{mainSet.title} — Результаты</h1>
        {saveError && (
          <p style={{ color: "#d97706", fontWeight: "bold" }}>⚠️ {saveError}</p>
        )}
        <TaskReview set={mainSet} answers={state.answers} />
        <button type="button" onClick={handleReset} style={{ marginTop: "20px" }}>
          Начать новую попытку
        </button>
      </div>
    );
  }

  if (showReview) {
    return (
      <div>
        <h1>{mainSet.title} — Обзор до завершения</h1>
        {saveError && (
          <p style={{ color: "#d97706", fontWeight: "bold" }}>⚠️ {saveError}</p>
        )}

        <TaskReview
          set={mainSet}
          answers={state.answers}
          onClear={(taskId) => dispatch({ type: "answerCleared", taskId })}
          onSelectTask={(taskId) => {
            dispatch({ type: "moved", taskId });
            setShowReview(false);
          }}
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="button" onClick={() => setShowReview(false)}>
            Вернуться к заданиям
          </button>
          <button
            type="button"
            onClick={handleFinish}
            style={{
              background: "#244a7c",
              color: "white",
              borderColor: "#244a7c",
            }}
          >
            Завершить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>{mainSet.title}</h1>
      <p>
        Прогресс: {progress.filled} из {progress.total}
        {unansweredTasks.length > 0
          ? ` (пропущено: ${unansweredTasks.map((t) => t.id).join(", ")})`
          : " (все задания заполнены)"}
      </p>

      {saveError && (
        <p style={{ color: "#d97706", fontWeight: "bold" }}>⚠️ {saveError}</p>
      )}

      <div className="container">
        <TaskList
          tasks={mainSet.tasks}
          answers={state.answers}
          selectedId={currentTask.id}
          onSelect={(taskId) => dispatch({ type: "moved", taskId })}
        />

        <div style={{ flex: 2 }}>
          <TaskCard
            task={currentTask}
            answer={currentAnswer}
            onAnswerChange={(ans) =>
              dispatch({ type: "answerChanged", answer: ans })
            }
            onClear={() =>
              dispatch({ type: "answerCleared", taskId: currentTask.id })
            }
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => {
                const prevId = mainSet.tasks[Math.max(0, safeIndex - 1)].id;
                dispatch({ type: "moved", taskId: prevId });
              }}
              disabled={safeIndex === 0}
            >
              Назад
            </button>

            <button
              type="button"
              onClick={() => {
                const nextId =
                  mainSet.tasks[Math.min(mainSet.tasks.length - 1, safeIndex + 1)]
                    .id;
                dispatch({ type: "moved", taskId: nextId });
              }}
              disabled={safeIndex === mainSet.tasks.length - 1}
            >
              Далее
            </button>

            <button type="button" onClick={() => setShowReview(true)}>
              Обзор ответов
            </button>

            <button
              type="button"
              onClick={handleFinish}
              style={{
                background: "#244a7c",
                color: "white",
                borderColor: "#244a7c",
              }}
            >
              Завершить попытку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}