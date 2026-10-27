import { Task } from "./domain";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <section style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
      <h2>{task.topic}</h2>
      <p>{task.prompt}</p>

      {"code" in task && task.code && (
        <pre style={{ background: "#f4f4f4", padding: "10px", overflowX: "auto" }}>
          <code>{task.code}</code>
        </pre>
      )}

      <div style={{ marginTop: "20px" }}>
        {task.kind === "single-choice" ? (
          <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            {task.options.map((option) => (
              <li key={option.id}>{option.label}</li>
            ))}
          </ul>
        ) : task.kind === "short-text" ? (
          <p><em>(Здесь будет поле для текстового ответа на следующих этапах)</em></p>
        ) : null}
      </div>
    </section>
  );
}