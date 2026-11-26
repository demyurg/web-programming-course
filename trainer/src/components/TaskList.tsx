// src/components/TaskList.tsx
import type { ReviewRow, Task } from "../domain";

type Props = {
  tasks: Task[];
  rows: ReviewRow[];
  selectedId: string;
  submitted: boolean;
  onSelect: (id: string) => void;
  onClear: (taskId: string) => void;
};

export function TaskList({
  tasks,
  rows,
  selectedId,
  submitted,
  onSelect,
  onClear,
}: Props) {
  if (tasks.length === 0) {
    return <p className="muted">В этом наборе пока нет заданий.</p>;
  }

  return (
    <nav className="task-list" aria-label="Список заданий и обзор попытки">
      <p className="task-list__title">Задания и обзор попытки</p>
      <ul>
        {tasks.map((task) => {
          const row = rows.find((r) => r.taskId === task.id);
          return (
            <li key={task.id} className="task-list__row">
              <button
                type="button"
                className="task-list__item"
                onClick={() => onSelect(task.id)}
                aria-current={task.id === selectedId}
              >
                <span className="task-list__id">{task.id}</span>
                {task.prompt}
              </button>

              <div className="task-list__answer">
                <span
                  className={
                    row?.value
                      ? "task-list__value"
                      : "task-list__value task-list__value--empty"
                  }
                >
                  {row?.value || "нет ответа"}
                </span>
                {!submitted && row?.value && (
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => onClear(task.id)}
                  >
                    Очистить
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}