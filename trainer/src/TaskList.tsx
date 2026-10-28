import type { Task } from "./domain";

type TaskListProps = {
  tasks: Task[];
  onSelect: (taskId: string) => void;
};

export function TaskList({ tasks, onSelect }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <button type="button" onClick={() => onSelect(task.id)}>
            {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
