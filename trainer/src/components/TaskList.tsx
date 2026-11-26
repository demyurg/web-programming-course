import type { Task } from "../domain/domain.js";

type TaskListProps = {
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function TaskList({ tasks, selectedId, onSelect }: TaskListProps) {
  if (tasks.length === 0) {
    return <p>В этом наборе нет заданий.</p>;
  }

  return (
    <nav aria-label="Список заданий">
      <h4>Задания ({tasks.length})</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: "0.5rem" }}>
            <button
              onClick={() => onSelect(task.id)}
              aria-pressed={selectedId === task.id}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem",
                cursor: "pointer",
                fontWeight: selectedId === task.id ? "bold" : "normal",
                backgroundColor: selectedId === task.id ? "#eef" : "transparent",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              {task.topic}: {task.prompt.slice(0, 50)}{task.prompt.length > 50 ? "..." : ""}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}