import type { Task } from "./domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  onChoose: (id: string) => void;
  disabled?: boolean;
};

export function TaskList({
  tasks,
  selectedId,
  onChoose,
  disabled = false,
}: TaskListProps) {
  return (
    <div className="list">
      {tasks.map((task, index) => (
        <button
          key={task.id}
          type="button"
          disabled={disabled}
          aria-current={task.id === selectedId ? "true" : undefined}
          onClick={() => onChoose(task.id)}
        >
          {index + 1}) {task.prompt}
        </button>
      ))}
    </div>
  );
}
