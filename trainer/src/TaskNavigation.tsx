import type { Task } from "./domain";

type TaskNavigationProps = {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
};

export default function TaskNavigation({tasks, onTaskSelect,}: TaskNavigationProps) {
  return (
    <div>
      <h2>Список заданий</h2>

      {tasks.map((task) => (
        <button key={task.id} onClick={() => onTaskSelect(task.id)}>
          {task.topic}: {task.prompt}
        </button>
      ))}
    </div>
  );
}
