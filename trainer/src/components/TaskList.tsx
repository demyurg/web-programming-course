import type { Task } from "../domain";

type TaskListProps = {
  tasks: Task[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
};

export function TaskList({ tasks, selectedTaskId, onSelectTask }: TaskListProps) {
  if (tasks.length === 0) {
    return <p>В наборе нет заданий.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            aria-pressed={task.id === selectedTaskId}
            onClick={() => onSelectTask(task.id)}
          >
            [{task.topic}] {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
