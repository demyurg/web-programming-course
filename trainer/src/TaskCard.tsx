import type { Task, Option } from "./domain";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  function renderOption(option: Option) {
    return <li key={option.id}>{option.label}</li>;
  }

  return (
    <article className="task-card">
      <h3>{task.id}</h3>
      <p><strong>Тема:</strong> {task.topic}</p>
      <p>{task.prompt}</p>

      {task.code !== undefined && (
        <pre>{task.code}</pre>
      )}

      {task.kind === "single-choice" && (
        <ul>{task.options.map(renderOption)}</ul>
      )}

      {task.kind === "short-text" && (
        <p>Это задание с текстовым ответом.</p>
      )}
    </article>
  );
}