import type { Task, Option, Answer } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswerChange: (ans: Answer) => void;
  onClear: () => void;
  disabled: boolean;
};

export function TaskCard({ task, answer, onAnswerChange, onClear, disabled }: TaskCardProps) {
  return (
    <article className="task-card">
      <h3>{task.id}</h3>
      <p><strong>Тема:</strong> {task.topic}</p>
      <p>{task.prompt}</p>

      {task.code !== undefined && (
        <pre>{task.code}</pre>
      )}

      {task.kind === "single-choice" && (
        <div className="options-list">
          {task.options.map((option: Option) => {
            let isChecked = false;
            if (answer && answer.kind === "single-choice") {
              if (answer.optionId === option.id) {
                isChecked = true;
              }
            }

            return (
              <label key={option.id} className="option-label">
                <input
                  type="radio"
                  name={task.id}
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => {
                    onAnswerChange({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option.id,
                    });
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}

      {task.kind === "short-text" && (
        <div className="text-answer">
          <textarea
            value={answer && answer.kind === "short-text" ? answer.text : ""}
            disabled={disabled}
            onChange={(event) => {
              onAnswerChange({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              });
            }}
            placeholder="Введите ваш ответ..."
            rows={4}
          />
        </div>
      )}

      {/* Кнопка очистки ответа */}
      {answer && !disabled && (
        <button onClick={onClear} className="btn-clear">
          Очистить ответ
        </button>
      )}
    </article>
  );
}