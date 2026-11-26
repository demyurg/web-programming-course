import { useReducer } from "react";
import type { Answer } from "./domain";
import { attemptReducer, buildReview, countProgress, findTaskById } from "./domain";
import { webBasics } from "./data/training-set";
import { TaskList } from "./components/TaskList";
import { AnswerField } from "./components/AnswerField";

function initialAttempt() {
  return {
    setId: webBasics.id,
    taskId: webBasics.tasks[0]?.id ?? "",
    answers: [],
    status: "in-progress" as const,
  };
}

export function App() {
  const [attempt, dispatch] = useReducer(attemptReducer, undefined, initialAttempt);

  const progress = countProgress(webBasics, attempt.answers);
  const currentTask = findTaskById(webBasics.tasks, attempt.taskId);
  const currentAnswer = attempt.answers.find((a) => a.taskId === attempt.taskId);
  const currentIndex = webBasics.tasks.findIndex((t) => t.id === attempt.taskId);
  const prevTask = currentIndex > 0 ? webBasics.tasks[currentIndex - 1] : undefined;
  const nextTask = currentIndex >= 0 ? webBasics.tasks[currentIndex + 1] : undefined;
  const submitted = attempt.status === "submitted";
  const reviewRows = buildReview(webBasics, attempt.answers);   
  function handleFinish() {
  if (progress.missing.length > 0) {
    const ok = window.confirm(`Не отвечено: ${progress.missing.join(", ")}. Завершить?`);
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
  {progress.missing.length > 0 && !submitted && (
    <p className="muted">Пропуски: {progress.missing.join(", ")}</p>
  )}
</header>

      <div className="layout">
        <TaskList                                               
          tasks={webBasics.tasks}
          rows={reviewRows}
          selectedId={attempt.taskId}
          submitted={submitted}
          onSelect={(id) => dispatch({ type: "moved", taskId: id })}
          onClear={(taskId) => dispatch({ type: "answerCleared", taskId })}
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
  </div>
</section>
      </div>
    </main>
  );
}