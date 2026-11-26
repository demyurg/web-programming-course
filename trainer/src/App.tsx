import { useState } from "react";
import { findTaskById } from "./domain";
import { useTrainer } from "./hooks/useTrainer";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { Progress } from "./Progress";
import { Review } from "./Review";

type View = "task" | "review";

export default function App() {
  const trainer = useTrainer();
  const [selectedId, setSelectedId] = useState("");
  const [view, setView] = useState<View>("task");

  const busy = trainer.isActionLoading;

  // Сообщения об ошибках и успешных запросах
  const messages = (
    <>
      {trainer.errorMessage && (
        <div className="warning" role="alert"
          style={{ borderColor: "red", background: "#ffebee", gridColumn: "1 / -1" }}>
          <p style={{ color: "darkred" }}>{trainer.errorMessage}</p>

          {trainer.retry && (
            <button disabled={busy} onClick={trainer.retry}>
              Повторить
            </button>
          )}
        </div>
      )}

      {trainer.successMessage && (
        <p role="status" style={{ color: "green", gridColumn: "1 / -1" }}>
          {trainer.successMessage}
        </p>
      )}
    </>
  );

  // Загрузка тренажёра
  if (trainer.isLoading) {
    return <main><h2>Загрузка тренажёра...</h2></main>;
  }

  // Восстановление или создание попытки
  if (!trainer.set || !trainer.attempt) {
    return (
      <main style={{ padding: 20 }}>
        <h2>{trainer.set?.title || "Тренажёр"}</h2>

        {messages}
        <p>{trainer.notice}</p>

        {trainer.set && trainer.notice && (
          <button disabled={busy} onClick={trainer.restart}>
            Начать новую попытку
          </button>
        )}
      </main>
    );
  }

  const tasks = trainer.tasks;
  const currentId = selectedId || tasks[0]?.id || "";
  const selectedTask = findTaskById(trainer.set, currentId);

  const index = tasks.findIndex(t => t.id === currentId);
  const prevTask = tasks[index - 1];
  const nextTask = tasks[index + 1];

  function openTask(id: string) {
    if (busy || trainer.retry) return;
    setSelectedId(id);
    setView("task");
  }

  function finishAttempt() {
    if (trainer.missingTasks.length > 0) {
      const confirmed = window.confirm(
        "Не все задания заполнены. Завершить попытку?"
      );

      if (!confirmed) return;
    }

    trainer.submit();
  }

  // Завершённая попытка
  if (trainer.attempt.status === "submitted") {
    return (
      <main>
        <h1>{trainer.set.title}</h1>
        {messages}

        {trainer.result ? (
          <Review
            tasks={tasks}
            answers={trainer.answersRecord}
            progress={trainer.progress}
            submitted={true}
            result={trainer.result}
            onClear={trainer.clearAnswer}
            onOpenTask={openTask}
            onRestart={trainer.restart}
            isActionLoading={busy}
          />
        ) : (
          <p>Попытка завершена. Результат пока не получен.</p>
        )}
      </main>
    );
  }

  const locked = busy || trainer.retry !== null;

  return (
    <main>
      <h1>{trainer.set.title}</h1>
      <p>Заданий: {tasks.length}</p>

      {messages}

      <aside className="sidebar">
        <Progress
          progress={trainer.progress}
          missingTasks={trainer.missingTasks}
        />

        <button
          type="button"
          className="review-toggle"
          aria-pressed={view === "review"}
          disabled={locked}
          onClick={() => setView(view === "review" ? "task" : "review")}
        >
          {view === "review" ? "← К заданию" : "Обзор ответов"}
        </button>

        <TaskList
          tasks={tasks}
          selectedId={view === "task" ? currentId : ""}
          missingIds={trainer.missingTasks.map(task => task.id)}
          onSelect={openTask}
        />
      </aside>

      <section className="workspace">
        {view === "review" ? (
          <Review
            tasks={tasks}
            answers={trainer.answersRecord}
            progress={trainer.progress}
            submitted={false}
            onClear={trainer.clearAnswer}
            onOpenTask={openTask}
            onRestart={trainer.restart}
            isActionLoading={locked}
          />
        ) : (
          <>
            {selectedTask ? (
              <TaskCard
                key={`${trainer.attempt.id}-${selectedTask.id}`}
                task={selectedTask}
                answer={trainer.answersRecord[selectedTask.id]}
                onAnswer={trainer.saveAnswer}
                onClear={trainer.clearAnswer}
                onDemoFail={ans => trainer.saveAnswer(ans, true)}
                disabled={locked}
                submitted={false}
              />
            ) : (
              <p>Задание не выбрано.</p>
            )}

            <div className="nav">
              <button
                type="button"
                disabled={!prevTask || locked}
                onClick={() => prevTask && openTask(prevTask.id)}
              >
                ← Назад
              </button>

              <button
                type="button"
                disabled={!nextTask || locked}
                onClick={() => nextTask && openTask(nextTask.id)}
              >
                Далее →
              </button>
            </div>
          </>
        )}

        {view !== "review" && (
          <button
            type="button"
            className="finish"
            disabled={locked}
            onClick={finishAttempt}
          >
            {busy ? "Загрузка..." : "Завершить попытку"}
          </button>
        )}
      </section>
    </main>
  );
}