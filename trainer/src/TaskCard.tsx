import { AnswerField, type FormEvent } from "./AnswerField";
import type { Answer, Task } from "./domain";

type TaskCardProps = {
  task: Task | undefined;
  answer: Answer | undefined;
  onChange: (event: FormEvent) => void;
  disabled: boolean;
};

export function TaskCard({ task, answer, onChange, disabled }: TaskCardProps) {
  if (!task) {
    return <p>Задание не выбрано</p>;
  }

  return (
    <article>
      <p>Тема: {task.topic}</p>
      <p>{task.prompt}</p>
      {task.code !== undefined ? <pre>{task.code}</pre> : null}
      <AnswerField
        task={task}
        answer={answer}
        onChange={onChange}
        disabled={disabled}
      />
    </article>
  );
}