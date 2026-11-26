import type { Task } from "../domain";
import type { SyncStatus } from "../attempt";

const MARK: Record<SyncStatus, string> = {
  empty: "",
  saved: "✓ ",
  unsaved: "✎ ",
};

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  syncOf: (taskId: string) => SyncStatus;
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, selectedId, syncOf, onSelect }: TaskListProps) {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            aria-pressed={task.id === selectedId}
            onClick={() => onSelect(task.id)}
          >
            {MARK[syncOf(task.id)]}
            {task.id}: {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
