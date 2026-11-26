import type { Task } from "./domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            className={
              task.id === selectedId
                ? "task-button task-button--active"
                : "task-button"
            }
            onClick={() => onSelect(task.id)}
            aria-pressed={task.id === selectedId}
          >
            <span className="task-button__id">{task.id}</span>
            <span className="task-button__topic">{task.topic}</span>
            <span className="task-button__prompt">{task.prompt}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}