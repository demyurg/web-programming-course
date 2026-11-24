import type { Answer, Task } from "../domain";
import { isAnswerFilled } from "../domain";

type TaskListProps = {
  tasks: Task[];
  selectedId: string;
  answers: Answer[];
  onSelect: (taskId: string) => void;
};

export function TaskList({ tasks, selectedId, answers, onSelect }: TaskListProps) {
  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const answer = answers.find((a) => a.taskId === task.id);
        const isFilled = answer !== undefined && isAnswerFilled(answer, task);
        
        let className = "";
        if (task.id === selectedId) className += "active ";
        if (isFilled) className += "filled";

        return (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onSelect(task.id)}
              className={className}
            >
              {task.id} {isFilled ? "✓" : ""}
            </button>
          </li>
        );
      })}
    </ul>
  );
}