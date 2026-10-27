import type { Task } from "./domain";

type TaskListProps = {
  tasks: Task [];
  onSelect: (taskId: string) => void;
  selectedId: string | null;
};

export default function TaskList({ tasks, onSelect, selectedId }: TaskListProps) {
  return (
    <div>
      <h2>Список заданий</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <button 
              type="button" 
              onClick={() => onSelect(task.id)}
              aria-current = {task.id === selectedId}
              style = {{
                fontWeight: task.id === selectedId ? "bold" : "normal"
              }}
            >
              {task.topic}: {task.prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}