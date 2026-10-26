import type { Task } from "../domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  onSelect: (taskId: string) => void;
};

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            onClick={() => onSelect(task.id)}
            aria-current={task.id === selectedId}
          >
            {task.id} — {task.topic}
          </button>
        </li>
      ))}
    </ul>
  );
}