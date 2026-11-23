import type { Answer, Task } from "./domain";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  tasks: Task[];
  answers: Answer[];
  disabled?: boolean;
  onAnswerChange: (answer: Answer) => void;
};

export function TaskList({ tasks, answers, disabled, onAnswerChange }: TaskListProps) {
  return (
    <div>
      {tasks.map((task) => {
        const currentAnswer = answers.find((a) => a.taskId === task.id);
        return (
          <TaskCard
            key={task.id}
            task={task}
            answer={currentAnswer}
            disabled={disabled}
            onAnswerChange={onAnswerChange}
          />
        );
      })}
    </div>
  );
}