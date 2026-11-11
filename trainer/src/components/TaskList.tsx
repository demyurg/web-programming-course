import type { Task } from "../domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  if (tasks.length === 0) {
    return <p>В этом модуле пока нет заданий.</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            onClick={() => onSelect(task.id)}
            aria-pressed={task.id === selectedId}
          >
            {task.id}: {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}