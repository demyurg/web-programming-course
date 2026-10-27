import type { Task, Answer } from "../domain";

type TaskListProps = {
  tasks: Task[];
  currentIndex: number;
  answers: Record<string, Answer>;
  onSelect: (index: number) => void;
};

export function TaskList({ tasks, currentIndex, answers, onSelect }: TaskListProps) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {tasks.map((task, index) => {
        const isActive = index === currentIndex;
        // Проверяем, есть ли ответ (с учетом пробелов)
        const ans = answers[task.id];
        const isFilled = ans && (ans.kind === "short-text" ? ans.text.trim().length > 0 : true);

        return (
          <li key={task.id} style={{ marginBottom: "8px" }}>
            <button
              onClick={() => onSelect(index)}
              style={{
                width: "100%", 
                textAlign: "left",
                backgroundColor: isActive ? "#007bff" : (isFilled ? "#e2e3e5" : "#fff"),
                color: isActive ? "#fff" : "#333",
                border: "1px solid #ccc"
              }}
            >
              {isFilled ? "✅ " : "⬜ "} Задание {index + 1}
            </button>
          </li>
        );
      })}
    </ul>
  );
}