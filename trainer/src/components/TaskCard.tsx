import type { Task } from "../domain/domain.js";

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <article style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
      <h3>{task.topic}</h3>
      <p>{task.prompt}</p>

      {task.code && (
        <pre style={{ background: "#f5f5f5", padding: "0.75rem", overflowX: "auto" }}>
          {task.code}
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {task.options.map((opt) => (
            <li key={opt.id} style={{ marginBottom: "0.5rem" }}>
              <label>
                <input type="radio" name={`option-${task.id}`} value={opt.id} disabled />
                {" "}{opt.label}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p><em>Это задание с текстовым ответом</em></p>
      )}
    </article>
  );
}