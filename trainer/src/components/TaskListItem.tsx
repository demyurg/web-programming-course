import type { Task } from "../domain";

type TaskListItemProps = {
  task: Task;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isAnswered: boolean;
};

export function TaskListItem({ task, onSelect, isSelected, isAnswered }: TaskListItemProps) {
  return (
    <li style={{ marginBottom: "0.5rem" }}>
      <button 
        type="button" 
        onClick={() => onSelect(task.id)}
        style={{ 
          fontWeight: isSelected ? "bold" : "normal",
          backgroundColor: isSelected ? "#e0e0e0" : "transparent",
          border: "1px solid #ccc",
          padding: "0.5rem",
          width: "100%",
          textAlign: "left",
          cursor: "pointer"
        }}
      >
        {/* Галочка, если на задание есть ответ */}
        {isAnswered ? "✅ " : "⬜ "} 
        <strong>{task.id}</strong> — {task.prompt}
      </button>
    </li>
  );
}