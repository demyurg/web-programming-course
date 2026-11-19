import type { Task } from "../domain";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <header className="task-card__header">
        <span className="task-card__id">{task.id}</span>
        <h2 className="task-card__prompt">{task.prompt}</h2>
        <span className="task-card__topic">{task.topic}</span>
      </header>

      {task.code !== undefined && (
        <pre className="task-card__code">{task.code}</pre>
      )}

      {task.kind === "single-choice" ? (
        <fieldset className="options">
          <legend>Выберите вариант ответа</legend>
          {task.options.map((option) => (
            <label key={option.id} className="option">
              <input type="radio" name={task.id} disabled />
              <span className="option__label">{option.label}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="notice">
          задание с текстовым ответом.
        </p>
      )}
    </article>
  );
}