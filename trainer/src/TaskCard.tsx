import type { Task } from "./domain";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article>
      <p>Тема: {task.topic}</p>
      <p>{task.prompt}</p>
      {task.code ? <pre>{task.code}</pre> : null}
      {task.kind === "single-choice" ? (
        <ul>
          {task.options.map((option) => (
            <li key={option.id}>{option.label}</li>
          ))}
        </ul>
      ) : (
        <p>Это текстовое задание. Поле ввода появится позже.</p>
      )}
    </article>
  );
}
