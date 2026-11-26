import { useEffect, useReducer, useState } from "react";
import type { Answer, Draft } from "./domain";
import { attemptReducer, countProgress, findTaskById, readDraft } from "./domain";
import { loadRaw, removeRaw, saveRaw } from "./storage";
import { webBasics } from "./data/training-set";
import { TaskList } from "./components/TaskList";
import { AnswerField } from "./components/AnswerField";

const STORAGE_KEY = `trainer-draft:${webBasics.id}`;

function initialDraft(): Draft {
  return {
    version: 1,
    setId: webBasics.id,
    taskId: webBasics.tasks[0]?.id ?? "",
    answers: [],
    status: "in-progress",
  };
}

export function App() {
  const [draft, dispatch] = useReducer(attemptReducer, undefined, initialDraft);
  const [notice, setNotice] = useState<string | null>(null);
  const [storageBroken, setStorageBroken] = useState(false);
  const [hydrated, setHydrated] = useState(false);


  useEffect(() => {
    const raw = loadRaw(STORAGE_KEY);
    const result = readDraft(raw, webBasics);
    if (result.kind === "ok") {
      dispatch({ type: "restored", draft: result.draft });
    } else if (result.kind === "invalid" || result.kind === "foreign") {
      setNotice(`${result.message} Нажмите «Сбросить черновик».`);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!saveRaw(STORAGE_KEY, JSON.stringify(draft))) {
      setStorageBroken(true);
    }
  }, [draft, hydrated]);

  const progress = countProgress(webBasics, draft.answers);
  const currentTask = findTaskById(webBasics.tasks, draft.taskId);
  const currentAnswer = draft.answers.find((a) => a.taskId === draft.taskId);
  const currentIndex = webBasics.tasks.findIndex((t) => t.id === draft.taskId);
  const prevTask = currentIndex > 0 ? webBasics.tasks[currentIndex - 1] : undefined;
  const nextTask = currentIndex >= 0 ? webBasics.tasks[currentIndex + 1] : undefined;
  const submitted = draft.status === "submitted";

  function handleReset() {
    removeRaw(STORAGE_KEY);
    dispatch({
      type: "reset",
      setId: webBasics.id,
      firstTaskId: webBasics.tasks[0]?.id ?? "",
    });
    setNotice(null);
  }

  function handleFinish() {
    if (progress.missing.length > 0) {
      const ok = window.confirm(
        `Не отвечено: ${progress.missing.join(", ")}. Завершить?`,
      );
      if (!ok) return;
    }
    dispatch({ type: "submitted" });
  }

  return (
    <main className="app">
      <header>
        <h1 className="app__title">{webBasics.title}</h1>
        <p className="app__subtitle">
          Прогресс: <strong>{progress.filled} из {progress.total}</strong>
          {submitted && " · попытка завершена"}
        </p>
        {storageBroken && (
          <p className="muted">
            Черновик не сохраняется: хранилище недоступно. Ввод продолжается.
          </p>
        )}
        {notice && (
          <p className="notice">
            {notice}{" "}
            <button type="button" className="btn" onClick={handleReset}>
              Сбросить черновик
            </button>
          </p>
        )}
      </header>

      <div className="layout">
        <TaskList
          tasks={webBasics.tasks}
          selectedId={draft.taskId}
          onSelect={(id) => dispatch({ type: "moved", taskId: id })}
        />

        <section aria-label="Текущее задание">
          {currentTask ? (
            <AnswerField
              task={currentTask}
              answer={currentAnswer}
              submitted={submitted}
              onChange={(next: Answer) =>
                dispatch({ type: "answerChanged", answer: next })
              }
              onClear={() =>
                dispatch({ type: "answerCleared", taskId: currentTask.id })
              }
            />
          ) : (
            <p className="muted">Выберите задание.</p>
          )}

          <div className="nav-buttons">
            <button
              type="button"
              className="btn"
              onClick={() => prevTask && dispatch({ type: "moved", taskId: prevTask.id })}
              disabled={!prevTask}
            >
              Назад
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => nextTask && dispatch({ type: "moved", taskId: nextTask.id })}
              disabled={!nextTask}
            >
              Далее
            </button>
            {!submitted && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleFinish}
              >
                Завершить
              </button>
            )}
            <button type="button" className="btn" onClick={handleReset}>
              Сбросить черновик
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}