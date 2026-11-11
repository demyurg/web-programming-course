import type { Task } from "../domain";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article>
      <h2>{task.prompt}</h2>
      <p>Тема: {task.topic}</p>

      {task.code !== undefined && (
        <pre>{task.code}</pre>
      )}

      {task.kind === "single-choice" ? (
        <ol>
          {task.options.map((option) => (
            <li key={option.id}>{option.label}</li>
          ))}
        </ol>
      ) : (
        <p>Это задание с текстовым ответом.</p>
      )}
    </article>
  );
}