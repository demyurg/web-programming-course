import { Task } from "./domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string | null;
  onChoose: (id: string) => void;
};

export function TaskList({ tasks, selectedId, onChoose }: TaskListProps) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onChoose(task.id)}
          aria-current={selectedId === task.id ? "true" : undefined}
          style={{
            padding: "10px",
            textAlign: "left",
            fontWeight: selectedId === task.id ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {task.topic}
        </button>
      ))}
    </nav>
  );
}