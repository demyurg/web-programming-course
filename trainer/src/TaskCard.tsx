import type { Task } from "./domain";

type TaskCardProps = {
  task: Task | undefined;
};

export function TaskCard({ task }: TaskCardProps) {
  if (!task) {
    return (
      <section className="task-card task-card--empty">
        <p>Задание не выбрано.</p>
      </section>
    );
  }

  return (
    <section className="task-card">
      <header className="task-card__header">
        <span className="task-card__topic">{task.topic}</span>
        <span className="task-card__id">{task.id}</span>
      </header>

      <p className="task-card__prompt">{task.prompt}</p>

      {task.code !== undefined && (
        <pre className="task-card__code">{task.code}</pre>
      )}

      {task.kind === "single-choice" ? (
        <ul className="task-card__options">
          {task.options.map((option) => (
            <li key={option.id}>{option.label}</li>
          ))}
        </ul>
      ) : (
        <p className="task-card__hint">
          Это задание с текстовым ответом. Поле ввода появится позже.
        </p>
      )}
    </section>
  );
}