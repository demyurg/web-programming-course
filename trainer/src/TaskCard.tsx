import { AnswerField } from "./AnswerField";
import type { Answer, FormEvent, Task } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  disabled: boolean;
  onFormEvent: (event: FormEvent) => void;
};

export function TaskCard({
  task,
  answer,
  disabled,
  onFormEvent,
}: TaskCardProps) {
  return (
    <article>
      <p>Тема: {task.topic}</p>
      <p>{task.prompt}</p>
      {task.code ? <pre>{task.code}</pre> : null}
      <AnswerField
        task={task}
        answer={answer}
        disabled={disabled}
        onFormEvent={onFormEvent}
      />
    </article>
  );
}
