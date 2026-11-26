
import type { Task } from "./domain.js";

type TaskListProps = {
  tasks: Task[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
};

export function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
}: TaskListProps) {
  return (
    <nav className="task-list" aria-label="Список заданий">
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onSelectTask(task.id)}
              aria-pressed={selectedTaskId === task.id}
            >
              {task.prompt}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
