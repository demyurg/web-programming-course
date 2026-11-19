import type { Task } from "../domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="muted">В этом наборе пока нет заданий.</p>;
  }

  return (
    <nav className="task-list" aria-label="Список заданий">
      <p className="task-list__title">Задания</p>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              className="task-list__item"
              onClick={() => onSelect(task.id)}
              aria-pressed={task.id === selectedId}
            >
              <span className="task-list__id">{task.id}</span>
              {task.prompt}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}