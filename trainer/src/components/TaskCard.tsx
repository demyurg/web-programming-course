import type { Answer, RequestState, Task } from "../domain";
import { isAnswerFilled, isSameAnswer } from "../attempt";

type TaskCardProps = {
  task: Task;
  draftAnswer: Answer | undefined;
  confirmedAnswer: Answer | undefined;
  isBusy: boolean;
  actionState: RequestState;
  onChangeDraft: (answer: Answer) => void;
  onSave: (answer: Answer) => void;
  onClear: (taskId: string) => void;
  onRetry: (() => void) | null;
};

export function TaskCard({
  task,
  draftAnswer,
  confirmedAnswer,
  isBusy,
  actionState,
  onChangeDraft,
  onSave,
  onClear,
  onRetry,
}: TaskCardProps) {
  const selectedOptionId =
    draftAnswer?.kind === "single-choice" ? draftAnswer.optionId : "";
  const text = draftAnswer?.kind === "short-text" ? draftAnswer.text : "";

  const hasDraft = isAnswerFilled(draftAnswer);
  const hasConfirmed = isAnswerFilled(confirmedAnswer);
  const isSynced = hasConfirmed && isSameAnswer(draftAnswer, confirmedAnswer);

  let statusText = "Ответ не сохранён";
  let statusClass = "sync-badge neutral";

  if (isBusy) {
    statusText = "Выполняется запрос...";
    statusClass = "sync-badge loading";
  } else if (isSynced) {
    statusText = "Подтверждено сервером";
    statusClass = "sync-badge saved";
  } else if (hasDraft) {
    statusText = "Есть несохранённые изменения";
    statusClass = "sync-badge dirty";
  }

  return (
    <article className="task-card">
      <div className="task-meta">
        <span className="topic">{task.topic}</span>
        <span className="task-kind">
          {task.kind === "single-choice"
            ? "Выбор ответа"
            : "Текстовое задание"}
        </span>
        <span className={statusClass}>{statusText}</span>
      </div>

      <h2>Условие задания</h2>
      <p>{task.prompt}</p>

      {task.code && (
        <pre className="code-block">
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <fieldset className="options" disabled={isBusy}>
          <legend>Варианты ответа</legend>
          {task.options.map((option) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={task.id}
                checked={selectedOptionId === option.id}
                onChange={() =>
                  onChangeDraft({
                    taskId: task.id,
                    kind: "single-choice",
                    optionId: option.id,
                  })
                }
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="text-answer">
          <label htmlFor={"answer-" + task.id}>Ваш ответ</label>
          <textarea
            id={"answer-" + task.id}
            rows={5}
            value={text}
            disabled={isBusy}
            onChange={(event) =>
              onChangeDraft({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              })
            }
          />
          {draftAnswer?.kind === "short-text" && !hasDraft && (
            <p className="field-hint">
              Пустой ответ или пробелы нельзя сохранить. Введите текст или нажмите «Очистить ответ».
            </p>
          )}
        </div>
      )}

      <div className="card-actions">
        <button
          type="button"
          className="action-button primary"
          onClick={() => {
            if (draftAnswer && isAnswerFilled(draftAnswer)) {
              onSave(draftAnswer);
            }
          }}
          disabled={isBusy || !hasDraft}
        >
          {isBusy ? "Сохранение..." : "Сохранить ответ"}
        </button>

        <button
          type="button"
          className="action-button clear-button"
          onClick={() => onClear(task.id)}
          disabled={isBusy || (!hasDraft && !hasConfirmed)}
        >
          Очистить ответ
        </button>
      </div>

      {actionState.status === "error" && (
        <div className="error-box" role="alert">
          <p>{actionState.message}</p>
          {onRetry && (
            <button
              type="button"
              className="action-button"
              onClick={onRetry}
              disabled={isBusy}
            >
              Повторить
            </button>
          )}
        </div>
      )}
    </article>
  );
}