import type { Task, Answer } from "../domain/domain.js";

type TaskCardFormProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (next: Answer) => void;
};

export function TaskCardForm({ task, answer, onChange }: TaskCardFormProps) {
  return (
    <article style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
      <h3>{task.topic}</h3>
      <p>{task.prompt}</p>
      
      {task.code && (
        <pre style={{ background: "#f5f5f5", padding: "0.75rem", overflowX: "auto", borderRadius: "4px" }}>
          {task.code}
        </pre>
      )}

      {/* Логика рендеринга полей ввода */}
      {task.kind === "single-choice" ? (
        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Выберите один вариант:</legend>
          {task.options.map((opt) => {
            // Проверяем, совпадает ли текущий ответ с этим вариантом
            const isSelected = 
              answer?.kind === "single-choice" && 
              answer.optionId === opt.id;
            
            return (
              <div key={opt.id} style={{ marginBottom: "0.5rem" }}>
                <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="radio"
                    name={`task-${task.id}`} // Уникальная группа для каждого задания
                    checked={isSelected}
                    onChange={() => onChange({ 
                      taskId: task.id, 
                      kind: "single-choice", 
                      optionId: opt.id 
                    })}
                  />
                  {opt.label}
                </label>
              </div>
            );
          })}
        </fieldset>
      ) : (
        <div>
          <label htmlFor={`text-${task.id}`} style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Ваш ответ:
          </label>
          <textarea
            id={`text-${task.id}`}
            rows={5}
            style={{ width: "100%", padding: "0.75rem", fontFamily: "inherit", boxSizing: "border-box" }}
            // Если ответа нет или он другого типа, показываем пустую строку
            value={answer?.kind === "short-text" ? answer.text : ""}
            onChange={(e) => onChange({ 
              taskId: task.id, 
              kind: "short-text", 
              text: e.target.value 
            })}
          />
        </div>
      )}
    </article>
  );
}