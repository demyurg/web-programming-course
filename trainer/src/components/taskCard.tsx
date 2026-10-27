import { Task } from "../domain";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>

      <h2>{task.prompt}</h2>
      <p><strong>Тема:</strong> {task.topic}</p>

      {task.code && (
        <pre style={{ background: "#f5f5f5", padding: "0.5rem", overflowX: "auto" }}>
          <code>{task.code}</code>
        </pre>
      )}


      {task.kind === "single-choice" ? (
        <div>
          <p><em>Выберите один из вариантов:</em></p>
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {task.options.map((option) => (
              <li 
                key={option.id} 
                style={{ padding: "0.25rem 0" }}
              >
                <label>
                  <input type="radio" name={`task-${task.id}`} disabled /> {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : (

        <p style={{ color: "#666", fontStyle: "italic" }}>
          Это задание с кратким текстовым ответом. Поле ввода упало вместе с Яндексом :(.
        </p>
      )}
    </section>
  );
}
