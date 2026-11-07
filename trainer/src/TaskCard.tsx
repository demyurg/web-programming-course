import type { Task, Answer } from "./domain";

// Тип пропсов для карточки
type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  disabled: boolean;
};

export function TaskCard({ task, answer, onAnswerChange, disabled }: TaskCardProps) {
  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#fff" }}>
      <h3 style={{ color: "#555", fontSize: "14px", textTransform: "uppercase" }}>
        Тема: {task.topic}
      </h3>
      <p style={{ fontSize: "18px", fontWeight: "bold", margin: "10px 0" }}>
        {task.text}
      </p>

      {/* Показ кода, если есть */}
      {task.code && (
        <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "4px", overflowX: "auto" }}>
          {task.code}
        </pre>
      )}

      {/* Поле для ответа */}
      <div style={{ marginTop: "20px" }}>
        {task.kind === "single-choice" ? (
          <fieldset disabled={disabled} style={{ border: "none", padding: 0 }}>
            <legend style={{ fontWeight: "bold", marginBottom: "10px" }}>Выберите вариант:</legend>
            {task.options.map((option) => (
              <label key={option} style={{ display: "block", margin: "10px 0", cursor: disabled ? "default" : "pointer" }}>
                <input
                  type="radio"
                  name={`task-${task.id}`}
                  value={option}
                  checked={answer?.kind === "single-choice" && answer.optionId === option}
                  onChange={() => {
                    onAnswerChange({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option,
                    });
                  }}
                  disabled={disabled}
                />
                {" "}{option}
              </label>
            ))}
          </fieldset>
        ) : (
          <div>
            <label htmlFor={`textarea-${task.id}`} style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
              Ваш ответ:
            </label>
            <textarea
              id={`textarea-${task.id}`}
              value={answer?.kind === "short-text" ? answer.text : ""}
              onChange={(e) => {
                onAnswerChange({
                  taskId: task.id,
                  kind: "short-text",
                  text: e.target.value,
                });
              }}
              disabled={disabled}
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px",
                fontFamily: "inherit",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}