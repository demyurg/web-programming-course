import type { Task } from "../domain";

type TaskListProps = {
  tasks: Task[];
  currentTaskId: string | undefined;
  disabled: boolean;
  onSelect: (taskId: string) => void;
};

export function TaskList({
  tasks,
  currentTaskId,
  disabled,
  onSelect,
}: TaskListProps) {
  return (
    <ul>
      {tasks.map((task, index) => (
        <li key={task.id}>
          <button
            type="button"
            disabled={disabled}
            aria-current={task.id === currentTaskId ? "true" : undefined}
            onClick={() => onSelect(task.id)}
          >
            {index + 1}. {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
