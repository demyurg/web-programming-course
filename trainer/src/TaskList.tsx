import type { Task } from "./domain";

type TaskListProps = {
  tasks: Pick<Task, "id" | "prompt">[];
  onSelect: (taskId: string) => void;
};

export default function TaskList({ tasks, onSelect }: TaskListProps) {
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