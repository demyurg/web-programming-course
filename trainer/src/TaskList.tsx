import type { Task } from "./domain";

type TaskListProps = {
  tasks: Task[];
  disabled: boolean;
  onSelect: (taskId: string) => void;
};

export function TaskList({ tasks, disabled, onSelect }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task, index) => (
        <li key={task.id}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(task.id)}
          >
            {index + 1}. {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
