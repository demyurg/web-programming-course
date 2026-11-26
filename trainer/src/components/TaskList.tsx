import type { Answer, Task } from "../domain";
import { findAnswer, isAnswerFilled } from "../attempt";

type TaskListProps = {
  tasks: Task[];
  selectedTaskId: string;
  confirmedAnswers: Answer[];
  onChoose: (id: string) => void;
};

export function TaskList({
  tasks,
  selectedTaskId,
  confirmedAnswers,
  onChoose,
}: TaskListProps) {
  return (
    <nav className="task-list" aria-label="Список заданий">
      {tasks.map((task, index) => {
        const isSaved = isAnswerFilled(findAnswer(confirmedAnswers, task.id));

        return (
          <button
            key={task.id}
            type="button"
            className={
              task.id === selectedTaskId
                ? "task-button selected"
                : "task-button"
            }
            onClick={() => onChoose(task.id)}
          >
            <span className="task-number">{index + 1}</span>
            <span className="task-topic-label">{task.topic}</span>
            {isSaved && (
              <span className="task-saved-mark" title="Ответ сохранён на сервере">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}