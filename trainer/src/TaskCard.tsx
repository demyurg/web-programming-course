import type { Task } from "./domain";

type TaskCardProps = {
  task: Task | undefined;
};

export function TaskCard({ task }: TaskCardProps) {
  if (!task) {
    return <p>Задание не выбрано</p>;
  }

  return (
    <article>
      <p>Тема: {task.topic}</p>
      <p>{task.prompt}</p>
      {task.code !== undefined ? <pre>{task.code}</pre> : null}
      {task.kind === "single-choice" ? (
        <ul>
          {task.options.map((option) => (
            <li key={option.id}>
              {option.id}. {option.label}
            </li>
          ))}
        </ul>
      ) : (
        <p>Это задание с коротким текстом. Поле ввода появится на следующем этапе.</p>
      )}
    </article>
  );
}
