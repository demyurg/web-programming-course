import { Task, Answer } from "../domain";

type TaskCardProps = {
  task: Task;
  currentAnswer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  isSubmitted: boolean;
};

export function TaskCard({ task, currentAnswer, onAnswerChange, isSubmitted }: TaskCardProps) {
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
        <fieldset disabled={isSubmitted} style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: "0.5rem", fontStyle: "italic" }}>Выберите один из вариантов:</legend>
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {task.options.map((option) => {
              const isChecked = currentAnswer?.kind === "single-choice" && currentAnswer.optionId === option.id;

              return (
                <li key={option.id} style={{ padding: "0.25rem 0" }}>
                  <label style={{ cursor: isSubmitted ? "not-allowed" : "pointer" }}>
                    <input
                      type="radio"
                      name={`task-${task.id}`}
                      checked={isChecked}
                      onChange={() => onAnswerChange({
                        taskId: task.id,
                        kind: "single-choice",
                        optionId: option.id
                      })}
                    />{" "}
                    {option.label}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor={`text-${task.id}`} style={{ fontStyle: "italic" }}>
            Введите ваш ответ:
          </label>
          <textarea
            id={`text-${task.id}`}

            value={currentAnswer?.kind === "short-text" ? currentAnswer.text : ""}
            disabled={isSubmitted}
            onChange={(event) => onAnswerChange({
              taskId: task.id,
              kind: "short-text",
              text: event.target.value
            })}
            placeholder={isSubmitted ? "Ответ не был введен" : "Начните писать здесь..."}
            rows={4}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #aaa",
              resize: "vertical"
            }}
          />
        </div>
      )}
    </section>
  );
}
