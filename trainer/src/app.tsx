import { useState, useEffect } from "react";
import {
  TrainingSet,
  Answer,
  ServerAttempt,
  AttemptResult,
  RequestState,
  ViewMode,
  findTaskById,
  calculateProgress,
  isAnswerFilled,
} from "./domain";
import { trainerApi } from "./api/trainerApi";
import { TaskList } from "./components/taskList";
import { TaskCard } from "./components/taskCard";
import { AttemptReview } from "./components/attemptReview";

const STORAGE_ATTEMPT_KEY = "trainer_attempt_id";

export default function App() {
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);
  const [attempt, setAttempt] = useState<ServerAttempt | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);

  const [initState, setInitState] = useState<RequestState>({ status: "loading" });
  const [actionState, setActionState] = useState<RequestState>({ status: "idle" });
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const [simulateFail, setSimulateFail] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<ViewMode>({ kind: "overview" });

  const loadInitialData = async () => {
    setInitState({ status: "loading" });
    setRestoreMessage(null);

    try {
      const sets = await trainerApi.getSets();
      if (sets.length === 0) {
        throw new Error("На сервере нет доступных учебных модулей.");
      }
      const loadedSet = await trainerApi.getSetById(sets[0].id);
      setTrainingSet(loadedSet);

      const firstTaskId = loadedSet.tasks[0]?.id;
      setViewMode(firstTaskId ? { kind: "task", taskId: firstTaskId } : { kind: "overview" });

      const savedAttemptId = localStorage.getItem(STORAGE_ATTEMPT_KEY);
      if (savedAttemptId) {
        try {
          const existingAttempt = await trainerApi.getAttempt(savedAttemptId);
          setAttempt(existingAttempt);
          if (existingAttempt.status !== "in-progress") {
            const res = await trainerApi.getResult(existingAttempt.id);
            setResult(res);
            setViewMode({ kind: "overview" });
          }
        } catch {
          localStorage.removeItem(STORAGE_ATTEMPT_KEY);
          setRestoreMessage("Предыдущую подтверждённую попытку не удалось восстановить (сервер не нашёл ID). Создана новая попытка.");
          const freshAttempt = await trainerApi.createAttempt(loadedSet.id);
          localStorage.setItem(STORAGE_ATTEMPT_KEY, freshAttempt.id);
          setAttempt(freshAttempt);
        }
      } else {
        setRestoreMessage("Сохранённый идентификатор попытки не найден. Начата новая попытка.");
        const freshAttempt = await trainerApi.createAttempt(loadedSet.id);
        localStorage.setItem(STORAGE_ATTEMPT_KEY, freshAttempt.id);
        setAttempt(freshAttempt);
      }

      setInitState({ status: "success" });
    } catch (err) {
      setInitState({
        status: "error",
        message: err instanceof Error ? err.message : "Не удалось подключиться к учебному серверу.",
      });
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSaveAnswer = async (answer: Answer) => {
    if (!attempt) return;
    setActionState({ status: "loading" });
    try {
      const updatedAttempt = await trainerApi.saveAnswer(attempt.id, answer, simulateFail);
      setAttempt(updatedAttempt);
      setActionState({ status: "success" });
    } catch (err) {
      setActionState({
        status: "error",
        message: err instanceof Error ? err.message : "Ошибка при сохранении ответа",
      });
    }
  };

  const handleClearAnswer = async (taskId: string) => {
    if (!attempt) return;
    setActionState({ status: "loading" });
    try {
      const updatedAttempt = await trainerApi.deleteAnswer(attempt.id, taskId, simulateFail);
      setAttempt(updatedAttempt);
      setActionState({ status: "success" });
    } catch (err) {
      setActionState({
        status: "error",
        message: err instanceof Error ? err.message : "Ошибка при удалении ответа",
      });
    }
  };

  const handleFinalize = async () => {
    if (!attempt || !trainingSet) return;

    const uncompletedTitles = trainingSet.tasks
      .filter((t) => !isAnswerFilled(attempt.answers.find((a) => a.taskId === t.id)))
      .map((t) => `«${t.topic}»`);

    if (uncompletedTitles.length > 0) {
      const ok = window.confirm(
        `Остались незаполненные задания по темам: ${uncompletedTitles.join(", ")}.\nЗавершить попытку?`
      );
      if (!ok) return;
    }

    setActionState({ status: "loading" });
    try {
      const submittedAttempt = await trainerApi.submitAttempt(attempt.id, simulateFail);
      setAttempt(submittedAttempt);
      const attemptResult = await trainerApi.getResult(submittedAttempt.id);
      setResult(attemptResult);
      setViewMode({ kind: "overview" });
      setActionState({ status: "success" });
    } catch (err) {
      setActionState({
        status: "error",
        message: err instanceof Error ? err.message : "Ошибка при завершении попытки",
      });
    }
  };


  const handleRestart = async () => {
    if (!trainingSet) return;
    setActionState({ status: "loading" });
    try {
      const freshAttempt = await trainerApi.createAttempt(trainingSet.id);
      localStorage.setItem(STORAGE_ATTEMPT_KEY, freshAttempt.id);
      setAttempt(freshAttempt);
      setResult(null);
      setRestoreMessage(null);
      const firstTaskId = trainingSet.tasks[0]?.id;
      setViewMode(firstTaskId ? { kind: "task", taskId: firstTaskId } : { kind: "overview" });
      setActionState({ status: "success" });
    } catch (err) {
      setActionState({
        status: "error",
        message: err instanceof Error ? err.message : "Не удалось создать новую попытку",
      });
    }
  };

  if (initState.status === "loading") {
    return <main style={{ padding: "20px", fontFamily: "sans-serif" }}>Загрузка модуля с сервера...</main>;
  }

  if (initState.status === "error" || !trainingSet || !attempt) {
    return (
      <main style={{ padding: "20px", fontFamily: "sans-serif", color: "red" }}>
        <h2>Ошибка подключения к API</h2>
        <p>{initState.status === "error" ? initState.message : "Неизвестная ошибка"}</p>
        <button type="button" onClick={loadInitialData} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Повторить загрузку
        </button>
      </main>
    );
  }

  const isSubmitted = attempt.status !== "in-progress";
  const progress = calculateProgress(trainingSet, attempt.answers);
  const currentTask = viewMode.kind === "task" ? findTaskById(trainingSet.tasks, viewMode.taskId) : undefined;
  const currentConfirmedAnswer = currentTask
    ? attempt.answers.find((a) => a.taskId === currentTask.id)
    : undefined;
  const isActionLoading = actionState.status === "loading";

  return (
    <main style={{ padding: "20px", maxWidth: "850px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>{trainingSet.title}</h1>
          <label
            style={{
              fontSize: "0.85rem",
              background: "#fff1f0",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ffa39e",
            }}
          >
            <input
              type="checkbox"
              checked={simulateFail}
              onChange={(e) => setSimulateFail(e.target.checked)}
            />{" "}
            Симулировать ошибку сервера (X-Demo-Fail: 1)
          </label>
        </div>

        <p style={{ fontSize: "0.85rem", color: "#666", margin: "4px 0" }}>
          ID серверной попытки: <code>{attempt.id}</code> | Статус: <strong>{attempt.status}</strong>
        </p>

        {restoreMessage && (
          <div
            style={{
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              padding: "8px 12px",
              borderRadius: "4px",
              margin: "8px 0",
              fontSize: "0.9rem",
            }}
          >
            {restoreMessage}
          </div>
        )}

        {actionState.status === "error" && (
          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              color: "#cf1322",
              padding: "10px",
              borderRadius: "4px",
              margin: "10px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.9rem"
            }}
          >
            <span>
              {actionState.message} (Ваш ввод сохранён, снимите галочку ошибки и повторите действие)
            </span>
            <button type="button" onClick={() => setActionState({ status: "idle" })} style={{ marginLeft: "10px" }}>
              Скрыть
            </button>
          </div>
        )}

        <div style={{ marginTop: "10px" }}>
          <progress value={progress.filled} max={progress.total} style={{ width: "100%", height: "18px" }} />
          <small>
            Подтверждено: {progress.filled} из {progress.total}
          </small>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "20px" }}>
        <div>
          <button
            type="button"
            onClick={() => setViewMode({ kind: "overview" })}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "10px",
              textAlign: "left",
              cursor: "pointer",
              backgroundColor: viewMode.kind === "overview" ? "#d0d0d0" : "#f0f0f0",
              fontWeight: viewMode.kind === "overview" ? "bold" : "normal",
              border: "1px solid #aaa",
              borderRadius: "4px",
            }}
          >
            Обзор
          </button>

          <TaskList
            tasks={trainingSet.tasks}
            activeId={viewMode.kind === "task" ? viewMode.taskId : null}
            answers={attempt.answers}
            onSelect={(id) => {
              setActionState({ status: "idle" });
              setViewMode({ kind: "task", taskId: id });
            }}
          />

          <div style={{ marginTop: "20px" }}>
            {!isSubmitted ? (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleFinalize}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: isActionLoading ? "#ccc" : "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isActionLoading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {isActionLoading ? "Отправка..." : "Завершить попытку"}
              </button>
            ) : (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleRestart}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: isActionLoading ? "#ccc" : "#52c41a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isActionLoading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {isActionLoading ? "Создание..." : "Новая попытка"}
              </button>
            )}
          </div>
        </div>

        {viewMode.kind === "overview" ? (
          <AttemptReview
            tasks={trainingSet.tasks}
            confirmedAnswers={attempt.answers}
            isSubmitted={isSubmitted}
            result={result}
            actionState={actionState}
            onClearAnswer={handleClearAnswer}
          />
        ) : (
          currentTask && (
            <TaskCard
              task={currentTask}
              confirmedAnswer={currentConfirmedAnswer}
              isSubmitted={isSubmitted}
              actionState={actionState}
              onSaveAnswer={handleSaveAnswer}
              onClearAnswer={handleClearAnswer}
            />
          )
        )}
      </div>
    </main>
  )
}
