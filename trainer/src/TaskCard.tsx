import { useState, useEffect } from "react";
import type { Answer, Task } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  onClear: (taskId: string) => void;
  onDemoFail: (answer: Answer) => void;
  disabled: boolean;
  submitted: boolean;
};

export function TaskCard({
  task, answer, onAnswer, onClear,
  onDemoFail, disabled, submitted
}: TaskCardProps) {
  const [localText, setLocalText] = useState("");
  const [localOption, setLocalOption] = useState("");

  useEffect(() => {
    setLocalText(answer?.kind === "short-text" ? answer.text : "");
    setLocalOption(answer?.kind === "single-choice" ? answer.optionId : "");
  }, [task.id, answer]);

  const locked = disabled || submitted;

  // Текущий ответ пользователя
  const currentAnswer: Answer = task.kind === "short-text"
    ? { taskId: task.id, kind: "short-text", text: localText }
    : { taskId: task.id, kind: "single-choice", optionId: localOption };

  const filled = task.kind === "short-text"
    ? localText.trim() !== ""
    : localOption !== "";

  return (
    <article className="task-card">
      <p>Тема: {task.topic}</p>
      <h2>{task.prompt}</h2>

      {task.code !== undefined && <pre>{task.code}</pre>}

      {task.kind === "single-choice" ? (
        <fieldset disabled={locked}>
          <legend>Выберите один вариант</legend>

          {task.options.map(option => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={task.id}
                checked={localOption === option.id}
                onChange={() => {
                  setLocalOption(option.id);
                  onAnswer({
                    taskId: task.id,
                    kind: "single-choice",
                    optionId: option.id
                  });
                }}
              />
              {option.id}) {option.label}
            </label>
          ))}
        </fieldset>
      ) : (
        <>
          <label className="text-answer">
            Ваш ответ
            <textarea
              rows={5}
              value={localText}
              onChange={e => setLocalText(e.target.value)}
              disabled={locked}
            />
          </label>

          <button
            type="button"
            style={{ marginTop: 16 }}
            disabled={locked || !filled}
            onClick={() => onAnswer(currentAnswer)}
          >
            Сохранить ответ
          </button>
        </>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          type="button"
          className="clear"
          style={{ marginTop: 0 }}
          disabled={locked || (!answer && !filled)}
          onClick={() => {
            if (answer) {
              onClear(task.id);
            } else {
              setLocalText("");
              setLocalOption("");
            }
          }}
        >
          Очистить ответ
        </button>

        <button
          type="button"
          className="clear"
          style={{ marginTop: 0, color: "#a33", borderColor: "#fcc" }}
          disabled={locked || !filled}
          onClick={() => onDemoFail(currentAnswer)}
        >
          Симулировать ошибку (500)
        </button>
      </div>
    </article>
  );
}