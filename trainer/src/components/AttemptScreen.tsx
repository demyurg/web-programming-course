import { useState, useReducer, useEffect } from "react";
import type { TrainingSet, Answer } from "../domain/domain.js";
import { getProgress } from "../domain/domain.js";
import type { AttemptState } from "../utils/draftValidation.js";
import { readDraft } from "../utils/draftValidation.js";
import { getStorageKey } from "../utils/draftStorage.js";
import { reducer } from "../logic/AttemptReducer.js";
import { TaskCardForm } from "./TaskCardForm.js";
import {
  createAttempt,
  getAttempt,
  saveAnswer,
  deleteAnswer,
  submitAttempt,
  getResult, 
} from "../api/trainerApi.js";
import type { Result, Attempt } from "../api/types.js";

// Состояние любого HTTP-запроса
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

type AttemptScreenProps = {
  trainingSet: TrainingSet;
};

export function AttemptScreen({ trainingSet }: AttemptScreenProps) {
  const tasks = trainingSet.tasks;
  const setId = trainingSet.id;
  const storageKey = getStorageKey(setId);

  const initialState: AttemptState = {
    currentIndex: 0,
    answers: [],
    status: "in-progress",
    attemptId: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [uiWarning, setUiWarning] = useState<string | undefined>(undefined);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Состояния HTTP-запросов
  const [saveRequests, setSaveRequests] = useState<Record<string, RequestState>>({});
  const [deleteRequests, setDeleteRequests] = useState<Record<string, RequestState>>({}); 
  const [submitRequest, setSubmitRequest] = useState<RequestState>({ status: "idle" });
  const [result, setResult] = useState<Result | null>(null);

  // счётчик перезапуска инициализации
  const [initKey, setInitKey] = useState(0);

  // 1. Инициализация попытки 
  useEffect(() => {
    setIsInitialLoad(true); // показываем загрузку при каждом перезапуске
    const initAttempt = async () => {
      try {
        // Читаем attemptId из localStorage (если есть)
        const raw = localStorage.getItem(storageKey);
        const draft = readDraft(raw, setId);
        let attemptId = draft?.attemptId || null;
        let serverAttempt: Attempt | null = null;

        // Пытаемся прочитать существующую попытку с сервера
        if (attemptId) {
          try {
            serverAttempt = await getAttempt(attemptId);
          } catch (e: any) {
            // Если 404 (сервер перезапустился) — attemptId устарел
            if (e.message?.includes("не найдена")) {
              attemptId = null;
            } else {
              throw e; // Сетевая ошибка — показываем предупреждение
            }
          }
        }

        // Если попытки нет — создаём новую
        if (!attemptId) {
          const newAttempt = await createAttempt(setId);
          attemptId = newAttempt.id;
          serverAttempt = newAttempt;
        }

        // Восстанавливаем ответы (серверные имеют приоритет)
        const answers = serverAttempt?.answers || draft?.answers || [];
        dispatch({ type: "attemptLoaded", attemptId, answers });

        // завершённая попытка после перезагрузки открывает результат, а не форму
        if (serverAttempt && serverAttempt.status === "submitted") {
          dispatch({ type: "submitted" });
          setResult(await getResult(serverAttempt.id));
        }
      } catch (e: any) {
        setUiWarning(`Ошибка подключения: ${e.message}`);
      } finally {
        setIsInitialLoad(false);
      }
    };
    initAttempt();
  }, [storageKey, setId, initKey]);

  // 2. Cохранение черновика в localstorage 
  useEffect(() => {
    if (isInitialLoad || !state.attemptId) return;
    const draft = {
      version: 1 as const,
      setId,
      attemptId: state.attemptId,
      taskId: tasks[state.currentIndex]?.id || "",
      answers: state.answers,
      status: state.status,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      setUiWarning("Не удалось сохранить черновик локально.");
    }
  }, [storageKey, setId, state, tasks.length, isInitialLoad]);

  // 3. Сохранение ответа на сервере
  const handleSaveAnswer = async (answer: Answer) => {
    if (!state.attemptId || state.status === "submitted") return;

    // Обновляем локальное состояние сразу
    dispatch({ type: "answerChanged", answer });
    setSaveRequests((prev) => ({ ...prev, [answer.taskId]: { status: "loading" } }));

    try {
      // Пустой текст = DELETE, непустой = PUT
      if (answer.kind === "short-text" && answer.text.trim() === "") {
        await deleteAnswer(state.attemptId, answer.taskId);
      } else {
        await saveAnswer(state.attemptId, answer);
      }
      setSaveRequests((prev) => ({ ...prev, [answer.taskId]: { status: "success" } }));
      setTimeout(() => {
        setSaveRequests((prev) => ({ ...prev, [answer.taskId]: { status: "idle" } }));
      }, 2000);
    } catch (e: any) {
      // В catch НЕ стираем локальный ввод — только показываем ошибку
      setSaveRequests((prev) => ({
        ...prev,
        [answer.taskId]: { status: "error", message: e.message },
      }));
    }
  };

  // 3.1 Удаление ответа 
  const handleDeleteAnswer = async (taskId: string) => {
    if (!state.attemptId || state.status === "submitted") return;
    setDeleteRequests((prev) => ({ ...prev, [taskId]: { status: "loading" } }));
    try {
      await deleteAnswer(state.attemptId, taskId);
      dispatch({ type: "answerRemoved", taskId }); // только после подтверждения сервера
      setDeleteRequests((prev) => ({ ...prev, [taskId]: { status: "idle" } }));
    } catch (e: any) {
      // Ответ остаётся на экране, ошибка видна, есть явный повтор
      setDeleteRequests((prev) => ({
        ...prev,
        [taskId]: { status: "error", message: e.message },
      }));
    }
  };

  // 4. Явный повтор при ошибке
  const handleRetrySave = async (taskId: string) => {
    const answer = state.answers.find((a) => a.taskId === taskId);
    if (answer) {
      await handleSaveAnswer(answer);
    }
  };

  // 5. Завершение попытки 
  const handleFinish = async () => {
    if (!state.attemptId) return;

    const missed = tasks.filter(
      (task) =>
        !state.answers.find((a) => {
          if (a.taskId !== task.id) return false;
          if (a.kind === "short-text") return a.text.trim().length > 0;
          return true;
        })
    );

    let message = "Все задания заполнены. Завершить попытку?";
    if (missed.length > 0) {
      const numbers = missed.map((t) => tasks.indexOf(t) + 1).join(", ");
      message = `Не заполнены задания №${numbers}. Всё равно завершить?`;
    }

    if (!window.confirm(message)) return;

    setSubmitRequest({ status: "loading" });
    try {
      const res = await submitAttempt(state.attemptId);
      setResult(res);
      dispatch({ type: "submitted" });
      setSubmitRequest({ status: "success" });
    } catch (e: any) {
      setSubmitRequest({ status: "error", message: e.message });
    }
  };

  const handleRestart = () => {
    dispatch({ type: "reset" });
    localStorage.removeItem(storageKey);
    setUiWarning(undefined);
    setResult(null);
    setSubmitRequest({ status: "idle" });
    setSaveRequests({});
    setDeleteRequests({});
    setInitKey((k) => k + 1); 
  };

  if (isInitialLoad) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Инициализация попытки...</div>;
  }

  const progress = getProgress(trainingSet, state.answers);
  const currentTask = tasks[state.currentIndex];
  const currentAnswer = currentTask
    ? state.answers.find((a) => a.taskId === currentTask.id)
    : undefined;
  const currentSaveState = currentTask ? saveRequests[currentTask.id] : undefined;
  const currentDeleteState = currentTask ? deleteRequests[currentTask.id] : undefined;

  // Экран результата
  if (state.status === "submitted" && result) {
    return (
      <section style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
        <h1>{trainingSet.title} — Результат</h1>

        {/* различаем pending-review и graded, null не подменяем нулём */}
        {result.status === "pending-review" ? (
          <div style={{ padding: "1rem", backgroundColor: "#fff3cd", border: "1px solid #ffeeba", borderRadius: "4px", marginBottom: "1rem" }}>
            ⏳ <strong>Ожидание проверки.</strong> Некоторые ответы требуют ручной оценки преподавателем.
          </div>
        ) : (
          <div style={{ padding: "1rem", backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "4px", marginBottom: "1rem" }}>
            ✅ Оценка: <strong>{result.score} из {result.maxScore}</strong>
          </div>
        )}

        <h3>Детали по заданиям:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {result.items.map((item) => {
            const task = tasks.find((t) => t.id === item.taskId);
            return (
              <li key={item.taskId} style={{ marginBottom: "1rem", padding: "0.5rem", borderBottom: "1px solid #eee" }}>
                <strong>{task?.topic}:</strong> {task?.prompt}
                <br />
                <em>
                  Статус: {item.status === "pending-review" ? "⏳ ожидание" : item.status === "correct" ? "✅ верно" : item.status === "incorrect" ? "❌ неверно" : "⚪ нет ответа"}
                  {item.score !== null && ` (${item.score}/${item.maxScore})`}
                </em>
                <br />
                <small style={{ color: "#666" }}>{item.feedback}</small>
              </li>
            );
          })}
        </ul>

        <button onClick={handleRestart} style={{ padding: "0.75rem 1.5rem", cursor: "pointer", marginTop: "1rem" }}>
          Начать новую попытку
        </button>
      </section>
    );
  }

  if (!currentTask) return <p>Заданий нет.</p>;

  return (
    <section style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>{trainingSet.title}</h1>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
          <span>Задание {state.currentIndex + 1} из {tasks.length}</span>
          <span>Прогресс: {progress.completed}/{progress.total}</span>
        </div>
      </header>

      {uiWarning && (
        <div style={{ padding: "1rem", backgroundColor: "#fff3cd", border: "1px solid #ffeeba", borderRadius: "4px", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {uiWarning}</span>
          {/*явный повтор инициализации */}
          <button onClick={() => setInitKey((k) => k + 1)} style={{ marginLeft: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
            Повторить
          </button>
        </div>
      )}

      <TaskCardForm
        task={currentTask}
        answer={currentAnswer}
        onChange={(next) => {
          // Для radio-кнопок сохраняем сразу, для текста — только локально обновляем
          if (next.kind === "single-choice") {
            handleSaveAnswer(next);
          } else {
            dispatch({ type: "answerChanged", answer: next });
          }
        }}
      />

      {/* Кнопки сохранения/удаления и статусы запросов */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {currentAnswer && currentAnswer.kind === "short-text" && (
          <button
            onClick={() => handleSaveAnswer(currentAnswer)}
            disabled={currentSaveState?.status === "loading" || !state.attemptId}
            style={{
              padding: "0.5rem 1rem",
              cursor: currentSaveState?.status === "loading" ? "not-allowed" : "pointer",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              opacity: currentSaveState?.status === "loading" ? 0.6 : 1,
            }}
          >
            {currentSaveState?.status === "loading" ? "Сохранение..." : "Сохранить ответ"}
          </button>
        )}

        {currentAnswer && (
          <button
            onClick={() => handleDeleteAnswer(currentTask.id)}
            disabled={currentDeleteState?.status === "loading" || !state.attemptId}
            style={{
              padding: "0.5rem 1rem",
              cursor: currentDeleteState?.status === "loading" ? "not-allowed" : "pointer",
              color: "#d32f2f",
              backgroundColor: "#fff",
              border: "1px solid #ffcdd2",
              borderRadius: "4px",
              opacity: currentDeleteState?.status === "loading" ? 0.6 : 1,
            }}
          >
            {currentDeleteState?.status === "loading" ? "Очистка..." : "Очистить"}
          </button>
        )}

        {currentSaveState?.status === "success" && <span style={{ color: "green" }}>✓ Сохранено</span>}
        {currentSaveState?.status === "error" && (
          <span style={{ color: "red" }}>
            ✗ {currentSaveState.message}{" "}
            <button onClick={() => handleRetrySave(currentTask.id)} style={{ marginLeft: "0.5rem" }}>
              Повторить
            </button>
          </span>
        )}
        {currentDeleteState?.status === "error" && (
          <span style={{ color: "red" }}>
            ✗ {currentDeleteState.message}{" "}
            <button onClick={() => handleDeleteAnswer(currentTask.id)} style={{ marginLeft: "0.5rem" }}>
              Повторить
            </button>
          </span>
        )}
      </div>

      {/* Навигация */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button
          onClick={() => dispatch({ type: "moved", index: Math.max(state.currentIndex - 1, 0) })}
          disabled={state.currentIndex === 0}
          style={{ padding: "0.75rem 1.5rem", cursor: state.currentIndex === 0 ? "not-allowed" : "pointer" }}
        >
          Назад
        </button>

        <button
          onClick={() => dispatch({ type: "moved", index: Math.min(state.currentIndex + 1, tasks.length - 1) })}
          disabled={state.currentIndex === tasks.length - 1}
          style={{ padding: "0.75rem 1.5rem", cursor: state.currentIndex === tasks.length - 1 ? "not-allowed" : "pointer", marginLeft: "auto" }}
        >
          Далее
        </button>

        {state.currentIndex === tasks.length - 1 && (
          <button
            onClick={handleFinish}
            disabled={submitRequest.status === "loading" || !state.attemptId}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: submitRequest.status === "loading" ? "not-allowed" : "pointer",
            }}
          >
            {submitRequest.status === "loading" ? "Отправка..." : "Завершить попытку"}
          </button>
        )}
      </div>

      {submitRequest.status === "error" && (
        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f8d7da", borderRadius: "4px" }}>
          Ошибка завершения: {submitRequest.message}
        </div>
      )}
    </section>
  );
}