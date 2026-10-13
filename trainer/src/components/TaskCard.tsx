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
        <pre>
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <ul>
          {task.options.map((option) => (
            <li key={option.id}>{option.label}</li>
          ))}
        </ul>
      ) : (
        <p>Это задание с коротким текстовым ответом.</p>
      )}
    </article>
  );
}