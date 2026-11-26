
import type { Task } from "./domain.js";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <h2>{task.prompt}</h2>

      <p>
        <strong>Тема:</strong> {task.topic}
      </p>

      {task.code && (
        <pre>
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <div>
          <h3>Варианты ответа:</h3>
          <ul>
            {task.options.map((option) => (
              <li key={option.id}>{option.label}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>
          Это задание с текстовым ответом. Ответ нужно сформулировать
          самостоятельно.
        </p>
      )}
    </article>
  );
}
