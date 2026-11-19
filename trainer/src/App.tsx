import { useState } from "react";
import type { Answer, TrainingSet } from "./domain";
import { findTaskById, countProgress } from "./domain";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";

const set1: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [
    {
      id: "ts-1",
      kind: "single-choice",
      topic: "typescript",
      prompt: "Что выведет этот JavaScript-код?",
      code: 'console.log("10" * 5);',
      options: [
        { id: "a", label: "105" },
        { id: "b", label: "50" },
        { id: "c", label: "Ошибка" },
      ],
    },
    {
      id: "ts-2",
      kind: "single-choice",
      topic: "typescript",
      prompt: "Что возвращает find, если элемент не найден?",
      options: [
        { id: "a", label: "undefined" },
        { id: "b", label: "Пустой массив" },
        { id: "c", label: "false" },
      ],
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "react",
      prompt: "Объясните, чем props компонента отличаются от его состояния.",
    },
    {
      id: "http-1",
      kind: "short-text",
      topic: "http",
      prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
    },
  ],
};

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(
    set1.tasks[0]?.id ?? null,
  );

  const selectedTask = selectedId
    ? findTaskById(set1.tasks, selectedId)
    : undefined;

  const answers: Answer[] = [];
  const progress = countProgress(set1, answers);

  return (
    <main className="app">
      <header>
        <h1 className="app__title">{set1.title}</h1>
        <p className="app__subtitle">
          Всего заданий: <strong>{set1.tasks.length}</strong> · Прогресс:{" "}
          <strong>
            {progress.filled} из {progress.total}
          </strong>
        </p>
      </header>

      <div className="layout">
        <TaskList
          tasks={set1.tasks}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <section aria-label="Текущее задание">
          {selectedTask ? (
            <TaskCard task={selectedTask} />
          ) : (
            <p className="muted">Выберите задание.</p>
          )}
        </section>
      </div>
    </main>
  );
}