import type { Task } from "./domain";

type TaskListItemProps = {
  task: Task;
  onSelect: (id: string) => void;
};

// При нажатии на кнопку вызывается не просто onSelect, а стрелочная функция. Нужно чтобы не выполнилось сразу при рендере
export function TaskListItem({ task, onSelect }: TaskListItemProps) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(task.id)}>
        <strong>{task.id}</strong> — {task.prompt}
      </button>
    </li>
  );
}