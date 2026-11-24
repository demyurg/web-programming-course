import type { Answer, Task } from "./domain";
import { isAnswerFilled } from "./domain";

type TaskListProps = {
  tasks: Task[];
  answers: Answer[];
  onSelect: (taskId: string) => void;
  selectedId: string | null;
};

export default function TaskList({
  tasks,
  answers,
  onSelect,
  selectedId,
}: TaskListProps) {
  return (
    <div>
      <h2>Список заданий</h2>
      <ul>
        {tasks.map((task) => {
          const answer = answers.find((a) => a.taskId === task.id);
          const filled = isAnswerFilled(task, answer);

          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onSelect(task.id)}
                aria-current={task.id === selectedId ? "true" : undefined}
                style={{
                  fontWeight: task.id === selectedId ? "bold" : "normal",
                }}
              >
                {filled ? "✓ " : "○ "}
                {task.topic}: {task.prompt}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}