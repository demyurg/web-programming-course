import type { Task } from "./domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  onSelect: (taskId: string) => void;
};

export function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  function renderTask(task: Task) {
    return (
      <li key={task.id}>
        <button
          type="button"
          onClick={() => onSelect(task.id)}
          aria-pressed={task.id === selectedId}
        >
          {task.id} — {task.topic}
        </button>
      </li>
    );
  }

  return <ul className="task-list">{tasks.map(renderTask)}</ul>;
}