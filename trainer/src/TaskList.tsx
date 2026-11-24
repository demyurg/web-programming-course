import type { Answer, Task } from "./domain";

type TaskListProps = {
  tasks: Pick<Task, "id" | "prompt">[];
  answers: Answer[];
  onSelect: (taskId: string) => void;
  selectedTaskId: string | null;
};

export default function TaskList({ tasks, answers, selectedTaskId, onSelect }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => {
        const answer = answers.find((answer) => answer.taskId === task.id);

        const isAnswered = answer
          ? answer.kind === "single-choice" || answer.text.trim().length > 0
          : false;

        return (
          <li key={task.id}>
            <button
              type="button"
              className={selectedTaskId === task.id ? "selected-task" : ""}
              onClick={() => onSelect(task.id)}
            >
              <span
                className={`task-status ${isAnswered ? "answered" : ""}`}
                aria-hidden="true"
              >
                {isAnswered ? "[+]" : "[-]"}
              </span>
              {" "}{task.prompt}
            </button>
          </li>
        );
      })}
    </ul>
  );
}