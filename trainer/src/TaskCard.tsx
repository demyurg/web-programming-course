import type { Answer, Task } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  disabled?: boolean;
  onAnswerChange: (answer: Answer) => void;
};

export function TaskCard({ task, answer, disabled = false, onAnswerChange }: TaskCardProps) {
  return (
    <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
      <h3>{task.prompt}</h3>
      {task.code && <pre style={{ background: "#f4f4f4", padding: "10px" }}>{task.code}</pre>}

      {task.kind === "single-choice" && (
        <div>
          {task.options.map((option) => {
            // Приводим answer к нужному типу, если он совпадает с текущим kind
            const isSelected = answer?.kind === "single-choice" && answer.optionId === option.id;
            return (
              <label key={option.id} style={{ display: "block" }}>
                <input
                  type="radio"
                  name={task.id}
                  value={option.id}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onAnswerChange({ taskId: task.id, kind: "single-choice", optionId: option.id })}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}

      {task.kind === "short-text" && (
        <textarea
          value={answer?.kind === "short-text" ? answer.text : ""}
          disabled={disabled}
          onChange={(e) => onAnswerChange({ taskId: task.id, kind: "short-text", text: e.target.value })}
          rows={4}
          style={{ width: "100%" }}
        />
      )}
    </div>
  );
}