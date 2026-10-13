import type { Task } from "../domain";

type TaskListProps = {
  tasks: Task[];
  selectedTaskId: string;
  onChoose: (id: string) => void;
};

export default function TaskList({ tasks, selectedTaskId, onChoose }: TaskListProps) {
  return (
    <nav className="task-list" aria-label="Задания модуля">
      <h2>Задания <span>{tasks.length}</span></h2>
      <ul>
        {tasks.map((task, index) => (
          <li key={task.id}>
            <button
              type="button"
              className="task-button"
              aria-current={task.id === selectedTaskId ? "true" : undefined}
              onClick={() => onChoose(task.id)}
            >
              <span className="task-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="task-summary">
                <span className="task-topic">{task.topic}</span>
                <span>{task.prompt}</span>
              </span>
              <span className="task-arrow" aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="list-hint">Выберите задание, чтобы прочитать его условие.</p>
    </nav>
  );
}
