import type { Task, Answer } from "./domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  answers: Answer[];
  onSelect: (id: string) => void;
};

export function TaskList({ tasks, selectedId, answers, onSelect }: TaskListProps) {
  // Проверяем, есть ли валидный ответ на задание
  const isAnswered = (taskId: string) => {
    const ans = answers.find(a => a.taskId === taskId);
    if (!ans) return false;
    if (ans.kind === "short-text") return ans.text.trim().length > 0;
    return !!ans.optionId;
  };

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            className={
              task.id === selectedId
                ? "task-button task-button--active"
                : "task-button"
            }
            onClick={() => onSelect(task.id)}
            aria-pressed={task.id === selectedId}
          >
            <span className="task-button__id">
              {isAnswered(task.id) ? "✓" : "○"} {task.id}
            </span>
            <span className="task-button__topic">{task.topic}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}