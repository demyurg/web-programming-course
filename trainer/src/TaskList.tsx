import type { Task, Answer } from "./domain";

// Тип пропсов для списка
type TaskListProps = {
  tasks: Task[];
  currentIndex: number;
  onSelect: (index: number) => void;
  answers: Answer[];
};

// Вспомогательная функция: проверен ли ответ
function isAnswerFilled(answer: Answer | undefined): boolean {
  if (!answer) return false;
  if (answer.kind === "short-text") {
    return answer.text.trim().length > 0;
  }
  return true;
}

export function TaskList({ tasks, currentIndex, onSelect, answers }: TaskListProps) {
  if (tasks.length === 0) {
    return <p>В этом модуле пока нет заданий.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {tasks.map((task, index) => {
        const answer = answers.find((a) => a.taskId === task.id);
        const filled = isAnswerFilled(answer);
        const isSelected = index === currentIndex;

        return (
          <button
            key={task.id}
            onClick={() => onSelect(index)}
            style={{
              padding: "12px",
              textAlign: "left",
              border: isSelected ? "2px solid #007bff" : "1px solid #ccc",
              borderRadius: "6px",
              background: isSelected ? "#e7f1ff" : "#fff",
              cursor: "pointer",
              fontWeight: isSelected ? "bold" : "normal",
            }}
          >
            {/* визуализация */}
            {filled ? "✓ " : "○ "}
            {task.topic}: {task.text.substring(0, 30)}...
          </button>
        );
      })}
    </div>
  );
}