import type { Answer, Task } from "../domain.js";
import type { SaveState } from "../types.js";
import { IDLE_SAVE, isAnswered } from "../types.js";

type TaskListProps = {
  tasks: readonly Task[];
  answers: readonly Answer[];
  saveStates: Record<string, SaveState>;
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function TaskList({
  tasks,
  answers,
  saveStates,
  currentIndex,
  onSelect,
}: TaskListProps) {
  return (
    <nav aria-label="Список заданий">
      <ul className="task-list">
        {tasks.map((task, index) => {
          const answer = answers.find((a) => a.taskId === task.id);
          const save: SaveState = saveStates[task.id] ?? IDLE_SAVE;
          const savedAndFilled = save.status === "saved" && isAnswered(answer);

          return (
            <li key={task.id}>
              <button
                type="button"
                className={
                  "task-list-item" +
                  (index === currentIndex ? " is-current" : "") +
                  (savedAndFilled ? " is-filled" : "")
                }
                onClick={() => onSelect(index)}
                aria-current={index === currentIndex ? "step" : undefined}
              >
                <span className="task-list-number">{index + 1}</span>
                <span className="task-list-question">{task.question}</span>
                <span className="task-list-status">
                  {savedAndFilled ? "✓" : isAnswered(answer) ? "○" : "·"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
