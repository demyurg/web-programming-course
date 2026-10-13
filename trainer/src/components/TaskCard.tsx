import type { Task } from "../domain";

type TaskCardProps = { task: Task };

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card" aria-labelledby="task-prompt">
      <div className="card-meta">
        <span className="topic-badge">{task.topic}</span>
        <span>{task.kind === "single-choice" ? "Один вариант" : "Короткий текст"}</span>
      </div>
      <h2 id="task-prompt">{task.prompt}</h2>
      {task.code !== undefined && (
        <div className="code-block">
          <p>Фрагмент кода</p>
          <pre><code>{task.code}</code></pre>
        </div>
      )}
      {task.kind === "single-choice" ? (
        <section className="options" aria-label="Варианты ответа">
          <h3>Варианты ответа</h3>
          <ul>
            {task.options.map((option) => (
              <li key={option.id}><span className="option-id">{option.id}</span><span>{option.label}</span></li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="text-notice">
          <h3>Задание с текстовым ответом</h3>
          <p>Подумайте над объяснением своими словами. На этом этапе доступен просмотр условия без ввода ответа.</p>
        </div>
      )}
    </article>
  );
}
