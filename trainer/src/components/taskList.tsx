import { Task } from "../domain";

type TaskListProps = {
  tasks: readonly Task[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, activeId, onSelect }: TaskListProps) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelect(task.id)}
          type="button"
          style={{
            padding: "0.5rem 1rem",
            textAlign: "left",
            cursor: "pointer",
            backgroundColor: task.id === activeId ? "#e0e0e0" : "#fff",
            border: "1px solid #aaa",
            borderRadius: "4px",
            fontWeight: task.id === activeId ? "bold" : "normal",
          }}
        >
          {task.topic}
        </button>
      ))}
    </nav>
  );
}
