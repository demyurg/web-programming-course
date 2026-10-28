import type { Task } from "./domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  onChoose: (id: string) => void;
};

export function TaskList({ tasks, selectedId, onChoose }: TaskListProps) {
  return (
    <div className="list">
      {tasks.map((task) => (
        <button
          key={task.id}
          type="button"
          aria-current={task.id === selectedId ? "true" : undefined}
          onClick={() => onChoose(task.id)}
        >
          {task.prompt}
        </button>
      ))}
    </div>
  );
}
