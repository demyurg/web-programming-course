import { useReducer, useState } from "react";
import type { Answer } from "./domain";
import { findTaskById } from "./domain";
import { webBasics } from "./data";
import {
  attemptReducer,
  createAttempt,
  getMissingTasks,
  getProgress,
} from "./attempt";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { Progress } from "./Progress";
import { Review } from "./Review";

type View = "task" | "review";

export default function App() {
  const [attempt, dispatch] = useReducer(attemptReducer, webBasics, createAttempt);

  const set = attempt.set;
  const firstId = set.tasks[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState<string>(firstId);
  const [view, setView] = useState<View>("task");

  const progress = getProgress(attempt);
  const missingTasks = getMissingTasks(attempt);

  const selectedTask = findTaskById(set, selectedId);
  const index = set.tasks.findIndex((task) => task.id === selectedId);
  const prevTask = set.tasks[index - 1];
  const nextTask = set.tasks[index + 1];

  function saveAnswer(answer: Answer) {
    dispatch({ type: "answer", answer });
  }

  function clearAnswer(taskId: string) {
    dispatch({ type: "clear", taskId });
  }

  function openTask(taskId: string) {
    setSelectedId(taskId);
    setView("task");
  }

  function startNewAttempt() {
    dispatch({ type: "restart" });
    setSelectedId(firstId);
    setView("task");
  }

  if (set.tasks.length === 0) {
    return (
      <main>
        <h1>{set.title}</h1>
        <p>В модуле пока нет заданий.</p>
      </main>
    );
  }

  if (attempt.status === "submitted") {
    return (
      <main>
        <h1>{set.title}</h1>
        <Review
          tasks={set.tasks}
          answers={attempt.answers}
          progress={progress}
          submitted={true}
          onClear={clearAnswer}
          onOpenTask={openTask}
          onRestart={startNewAttempt}
        />
      </main>
    );
  }

  return (
    <main>
      <h1>{set.title}</h1>
      <p>Заданий: {set.tasks.length}</p>

      <aside className="sidebar">
        <Progress progress={progress} missingTasks={missingTasks} />
        <button
          type="button"
          className="review-toggle"
          aria-pressed={view === "review"}
          onClick={() => setView(view === "review" ? "task" : "review")}
        >
          {view === "review" ? "← К заданию" : "Обзор ответов"}
        </button>
        <TaskList
          tasks={set.tasks}
          selectedId={view === "task" ? selectedId : ""}
          missingIds={missingTasks.map((task) => task.id)}
          onSelect={openTask}
        />
      </aside>

      <section className="workspace">
        {view === "review" ? (
          <Review
            tasks={set.tasks}
            answers={attempt.answers}
            progress={progress}
            submitted={false}
            onClear={clearAnswer}
            onOpenTask={openTask}
            onRestart={startNewAttempt}
          />
        ) : (
          <>
            {selectedTask === undefined ? (
              <p>Задание не выбрано.</p>
            ) : (
              <TaskCard
                task={selectedTask}
                answer={attempt.answers[selectedTask.id]}
                onAnswer={saveAnswer}
                onClear={clearAnswer}
              />
            )}

            <div className="nav">
              <button
                type="button"
                disabled={prevTask === undefined}
                onClick={() => prevTask && setSelectedId(prevTask.id)}
              >
                ← Назад
              </button>
              <button
                type="button"
                disabled={nextTask === undefined}
                onClick={() => nextTask && setSelectedId(nextTask.id)}
              >
                Далее →
              </button>
            </div>
          </>
        )}

        {attempt.status === "confirming" ? (
          <div className="warning" role="alert">
            {missingTasks.length > 0 ? (
              <p>
                Не заполнены задания:{" "}
                {missingTasks.map((task) => task.id).join(", ")}. Завершить
                попытку?
              </p>
            ) : (
              <p>Все задания заполнены. Завершить попытку?</p>
            )}
            <button type="button" onClick={() => dispatch({ type: "confirm-finish" })}>
              Да, завершить
            </button>
            <button type="button" onClick={() => dispatch({ type: "cancel-finish" })}>
              Вернуться к заданиям
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="finish"
            onClick={() => dispatch({ type: "request-finish" })}
          >
            Завершить попытку
          </button>
        )}
      </section>
    </main>
  );
}