import { useState } from "react";
import type { Answer } from "./domain";
import { countProgress, findTaskById } from "./domain";
import { webBasics } from "./data/training-set";
import { TaskList } from "./components/TaskList";
import { AnswerField } from "./components/AnswerField";

export function App() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedId, setSelectedId] = useState<string>(
    webBasics.tasks[0]?.id ?? "",
  );
  const [submitted, setSubmitted] = useState(false);

  const progress = countProgress(webBasics, answers);

  function handleRestart() {
    setAnswers([]);
    setSelectedId(webBasics.tasks[0]?.id ?? "");
    setSubmitted(false);
  }

  function handleFinish() {
    if (progress.missing.length > 0) {
      const ok = window.confirm(
        `Не отвечено: ${progress.missing.join(", ")}. Завершить?`,
      );
      if (!ok) return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="app">
        <h1 className="app__title">{webBasics.title}</h1>
        <section className="review">
          <h2>Обзор попытки</h2>
          <ul>
            {webBasics.tasks.map((task) => {
              const answer = answers.find((a) => a.taskId === task.id);
              return (
                <li key={task.id} className="review__item">
                  <span className="review__id">{task.id}</span>
                  {progress.missing.includes(task.id) ? (
                    <span className="review__value review__value--empty">
                      нет ответа
                    </span>
                  ) : answer?.kind === "single-choice" ? (
                    <span className="review__value">
                      вариант: {answer.optionId}
                    </span>
                  ) : answer?.kind === "short-text" ? (
                    <span className="review__value">{answer.text}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleRestart}
          >
            Начать новую попытку
          </button>
        </section>
      </main>
    );
  }

  const currentTask = findTaskById(webBasics.tasks, selectedId);
  const currentAnswer = answers.find((a) => a.taskId === selectedId);
  const currentIndex = webBasics.tasks.findIndex((t) => t.id === selectedId);
  const prevTask =
    currentIndex > 0 ? webBasics.tasks[currentIndex - 1] : undefined;
  const nextTask =
    currentIndex >= 0 ? webBasics.tasks[currentIndex + 1] : undefined;

  function replaceAnswer(next: Answer) {
    setAnswers((current) => [
      ...current.filter((a) => a.taskId !== next.taskId),
      next,
    ]);
  }

  return (
    <main className="app">
      <header>
        <h1 className="app__title">{webBasics.title}</h1>
        <p className="app__subtitle">
          Всего заданий: <strong>{webBasics.tasks.length}</strong> · Прогресс:{" "}
          <strong>
            {progress.filled} из {progress.total}
          </strong>
        </p>
      </header>

      <div className="layout">
        <TaskList
          tasks={webBasics.tasks}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <section aria-label="Текущее задание">
          {currentTask ? (
            <AnswerField
              task={currentTask}
              answer={currentAnswer}
              onChange={replaceAnswer}
            />
          ) : (
            <p className="muted">Выберите задание.</p>
          )}

          <div className="nav-buttons">
            <button
              type="button"
              className="btn"
              onClick={() => prevTask && setSelectedId(prevTask.id)}
              disabled={!prevTask}
            >
              Назад
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => nextTask && setSelectedId(nextTask.id)}
              disabled={!nextTask}
            >
              Далее
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleFinish}
            >
              Завершить
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}