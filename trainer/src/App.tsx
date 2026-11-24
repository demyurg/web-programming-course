import { useEffect, useState } from "react";
import type { TrainingSet, Answer } from "./domain";
import { findTaskById } from "./domain";
import { loadSet } from "./api/sets";
import {createAttempt, loadAttempt, saveAnswer, deleteAnswer, submitAttempt, type ServerAttempt} from "./api/attempts";
import {saveAttemptId,readAttemptId,clearAttemptId,type RequestState} from "./model/attemptServer";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { TaskReview } from "./components/TaskReview";
import { AttemptResult } from "./components/AttemptResult";

const SET_ID = "web-basics";

export default function App() {
  const [set, setSet] = useState<TrainingSet | null>(null);
  const [attempt, setAttempt] = useState<ServerAttempt | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [showReview, setShowReview] = useState(false);
  const [requestState, setRequestState] = useState<RequestState>({ status: "idle" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<ServerAttempt["result"]>(null);
  const [isPending, setIsPending] = useState(false);
  const [demoFail, setDemoFail] = useState(false);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRequestState({ status: "loading" });
      try {
        const loadedSet = await loadSet(SET_ID);
        if (cancelled) return;
        setSet(loadedSet);
        setSelectedId(loadedSet.tasks[0]?.id ?? "");

        const savedId = readAttemptId();
        if (savedId) {
          try {
            const existing = await loadAttempt(savedId);
            if (!cancelled) {
              setAttempt(existing);
              setRequestState({ status: "success" });
            }
            return;
          } catch {
            clearAttemptId();
          }
        }

        const created = await createAttempt(SET_ID);
        if (cancelled) return;
        saveAttemptId(created.id);
        setAttempt(created);
        setRequestState({ status: "success" });
      } catch (err) {
        if (!cancelled) {
          setRequestState({
            status: "error",
            message: err instanceof Error ? err.message : "Неизвестная ошибка",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentTask = set && attempt
    ? findTaskById(set.tasks, selectedId)
    : undefined;

  const currentIndex = set
    ? set.tasks.findIndex((t) => t.id === selectedId)
    : -1;

  const handleSaveAnswer = async (answer: Answer) => {
    if (!attempt) return;
    setIsPending(true);
    setErrorMessage(null);
    setRequestState({ status: "loading" });

    const previous = attempt.answers;


    setAttempt({
      ...attempt,
      answers: previous.some((a) => a.taskId === answer.taskId)
        ? previous.map((a) => (a.taskId === answer.taskId ? answer : a))
        : [...previous, answer],
    });

    try {
      await saveAnswer(attempt.id, answer, demoFail);
      setRequestState({ status: "success" });
    } catch (err) {


      setAttempt({ ...attempt, answers: previous });
      setRequestState({
        status: "error",
        message: err instanceof Error ? err.message : "Ошибка сохранения",
      });
      setErrorMessage("Не удалось сохранить ответ. Повторите попытку.");
    } finally {
      setIsPending(false);
    }
  };

  const handleClearAnswer = async (taskId: string) => {
    if (!attempt) return;
    setIsPending(true);
    setErrorMessage(null);
    setRequestState({ status: "loading" });

    const previous = attempt.answers;
    setAttempt({
      ...attempt,
      answers: previous.filter((a) => a.taskId !== taskId),
    });

    try {
      await deleteAnswer(attempt.id, taskId);
      setRequestState({ status: "success" });
    } catch (err) {
      setAttempt({ ...attempt, answers: previous });
      setRequestState({
        status: "error",
        message: err instanceof Error ? err.message : "Ошибка удаления",
      });
      setErrorMessage("Не удалось очистить ответ. Повторите попытку.");
    } finally {
      setIsPending(false);
    }
  };

const handleSubmit = async () => {
  if (!attempt) return;
  setIsPending(true);
  setErrorMessage(null);
  setRequestState({ status: "loading" });

  try {
    const result = await submitAttempt(attempt.id);
    
    setSubmittedResult(result);
    setAttempt({ ...attempt, status: "submitted", result });
    setRequestState({ status: "success" });
  } catch (err) {
    setRequestState({
      status: "error",
      message: err instanceof Error ? err.message : "Ошибка завершения",
    });
    setErrorMessage("Не удалось завершить попытку. Повторите попытку.");
  } finally {
    setIsPending(false);
  }
};

  const handleRestart = () => {
    clearAttemptId();
    window.location.reload();
  };

  if (requestState.status === "loading" && !attempt) {
    return <main><p>Загрузка модуля…</p></main>;
  }

  if (requestState.status === "error" && !attempt) {
    return (
      <main>
        <h1>Ошибка</h1>
        <p>{requestState.message}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Повторить
        </button>
      </main>
    );
  }

  if (!set || !attempt) {
    return <main><p>Нет данных.</p></main>;
  }

  const isSubmitted = attempt.status === "submitted";

  if (isSubmitted) {
    if (!submittedResult) {
      return <main><p>Загрузка результата…</p></main>;
    }
    return (
      <AttemptResult
        set={set}
        result={submittedResult}
        onRestart={handleRestart}
      />
    );
  }

  if (showReview) {
    return (
      <main>
        <h1>{set.title}</h1>
        <h2>Обзор ответов (до завершения)</h2>
        <TaskReview
          tasks={set.tasks}
          answers={attempt.answers}
          onClear={handleClearAnswer}
          onSelectTask={(taskId) => {
            setSelectedId(taskId);
            setShowReview(false);
          }}
          disabled={isPending}
        />
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button onClick={() => setShowReview(false)} className="btn-secondary" disabled={isPending}>
            Вернуться к заданиям
          </button>
          <button onClick={handleSubmit} className="btn-success" disabled={isPending}>
            Завершить
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>{set.title}</h1>

      {errorMessage && (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>
          {errorMessage}{" "}
          <button onClick={() => setErrorMessage(null)} className="btn-secondary btn-sm">
            Скрыть
          </button>
        </div>
      )}

      <div className="progress-container">
        <div className="progress-text">
          Заполнено: {attempt.answers.length} из {set.tasks.length}
        </div>
        <progress value={attempt.answers.length} max={set.tasks.length} />
      </div>

      <TaskList
        tasks={set.tasks}
        selectedId={selectedId}
        answers={attempt.answers}
        onSelect={setSelectedId}
      />

      {currentTask ? (
        <TaskCard
          task={currentTask}
          answer={attempt.answers.find((a) => a.taskId === currentTask.id)}
          onChange={handleSaveAnswer}
          disabled={isPending}
        />
      ) : (
        <p>Задание не найдено.</p>
      )}

      <div className="controls">
        <button
          onClick={() => currentIndex > 0 && setSelectedId(set.tasks[currentIndex - 1].id)}
          disabled={currentIndex <= 0 || isPending}
          className="btn-secondary"
        >
          Назад
        </button>
        <button
          onClick={() => currentIndex < set.tasks.length - 1 && setSelectedId(set.tasks[currentIndex + 1].id)}
          disabled={currentIndex === set.tasks.length - 1 || isPending}
          className="btn-secondary"
        >
          Далее
        </button>

        <button onClick={() => handleClearAnswer(selectedId)} className="btn-secondary btn-right" disabled={isPending}>
          Очистить
        </button>

        <button onClick={() => setShowReview(true)} className="btn-secondary" disabled={isPending}>
          Обзор
        </button>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={demoFail}
            onChange={(e) => setDemoFail(e.target.checked)}
            disabled={isPending}
          />
          Ошибка сервера
        </label>

        <button onClick={handleSubmit} className="btn-success" disabled={isPending}>
          Завершить
        </button>
      </div>
    </main>
  );
}