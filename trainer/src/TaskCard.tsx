import type { Task, Answer } from "./domain";

type TaskCardProps = {
  task: Task;
  answer?: Answer;
  onAnswerChange: (ans: Answer) => void;
  onClear?: () => void;
  disabled?: boolean;
};

export default function TaskCard({
  task,
  answer,
  onAnswerChange,
  onClear,
  disabled,
}: TaskCardProps) {
  const hasAnswer = answer !== undefined;

  return (
    <section>
      <h2>{task.topic}</h2>
      <p>{task.prompt}</p>

      {task.code && (
        <pre>
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
          {task.options.map((option) => {
            const isChecked =
              answer?.kind === "single-choice" && answer.optionId === option.id;

            return (
              <label key={option.id} style={{ cursor: disabled ? "default" : "pointer" }}>
                <input
                  type="radio"
                  name={task.id}
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() =>
                    onAnswerChange({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option.id,
                    })
                  }
                  style={{ marginRight: "8px" }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}

      {task.kind === "short-text" && (
        <div style={{ marginTop: "16px" }}>
          <textarea
            value={answer?.kind === "short-text" ? answer.text : ""}
            disabled={disabled}
            onChange={(event) =>
              onAnswerChange({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              })
            }
            placeholder="Введите ваш ответ..."
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "8px",
              fontFamily: "inherit",
            }}
          />
          <small style={{ display: "block", marginTop: "4px", color: "#555" }}>
            Строка из пробелов не считается заполненным ответом.
          </small>
        </div>
      )}

      {!disabled && onClear && (
        <div style={{ marginTop: "12px" }}>
          <button
            type="button"
            onClick={onClear}
            disabled={!hasAnswer}
          >
            Очистить ответ
          </button>
        </div>
      )}
    </section>
  );
}