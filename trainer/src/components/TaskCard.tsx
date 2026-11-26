import type { Answer, Task } from "../domain";
import { isAnswerFilled } from "../domain";
import type { SyncStatus } from "../attempt";

const SYNC_TEXT: Record<SyncStatus, string> = {
  empty: "Ответа нет",
  saved: "Сохранено на сервере",
  unsaved: "Не сохранено на сервере",
};

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  sync: SyncStatus;
  canClear: boolean;
  busy: boolean;
  error: string | null;
  onAnswer: (answer: Answer) => void;
  onSave: () => void;
  onClear: () => void;
};

export function TaskCard({
  task,
  answer,
  sync,
  canClear,
  busy,
  error,
  onAnswer,
  onSave,
  onClear,
}: TaskCardProps) {
  const selectedOptionId =
    answer?.kind === "single-choice" ? answer.optionId : undefined;
  const text = answer?.kind === "short-text" ? answer.text : "";
  const canSave = answer !== undefined && isAnswerFilled(answer) && sync === "unsaved";

  return (
    <article className="task-card">
      <p className="topic">Тема: {task.topic}</p>
      <h2>{task.prompt}</h2>
      {task.code !== undefined && <pre>{task.code}</pre>}
      {task.kind === "single-choice" ? (
        <fieldset>
          <legend>Выберите вариант</legend>
          {task.options.map((option) => (
            <div key={option.id}>
              <label>
                <input
                  type="radio"
                  name={`task-${task.id}`}
                  checked={selectedOptionId === option.id}
                  onChange={() =>
                    onAnswer({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option.id,
                    })
                  }
                />{" "}
                {option.id}) {option.label}
              </label>
            </div>
          ))}
        </fieldset>
      ) : (
        <label>
          Ваш ответ
          <textarea
            rows={5}
            value={text}
            onChange={(event) =>
              onAnswer({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              })
            }
          />
        </label>
      )}
      <div className="actions">
        <button type="button" disabled={busy || !canSave} onClick={onSave}>
          Сохранить ответ
        </button>
        <button type="button" disabled={busy || !canClear} onClick={onClear}>
          Очистить ответ
        </button>
      </div>
      <p className="status">{busy ? "Отправка запроса…" : SYNC_TEXT[sync]}</p>
      {error !== null && (
        <p role="alert" className="error">
          {error} Ответ остался на экране: нажмите кнопку ещё раз, чтобы повторить.
        </p>
      )}
    </article>
  );
}
