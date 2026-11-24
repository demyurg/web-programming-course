import type { Answer, Task } from "../domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
};

export function TaskCard({ task, answer, onChange }: TaskCardProps) {
  return (
    <article className="task-card">
      <p><strong>Тема:</strong> {task.topic}</p>
      <p>{task.prompt}</p>

      {task.code !== undefined && <pre>{task.code}</pre>}

      {task.kind === "single-choice" ? (
        <fieldset>
          <legend>Выберите вариант:</legend>
          {task.options.map((option) => (
            <label key={option.id}>
              <input
                type="radio"
                name={`task-${task.id}`}
                value={option.id}
                checked={answer?.kind === "single-choice" && answer.optionId === option.id}
                onChange={() => {
                  onChange({ taskId: task.id, kind: "single-choice", optionId: option.id });
                }}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      ) : (
        <div>
          <label>
            <strong>Ваш ответ:</strong>
            <textarea
              value={answer?.kind === "short-text" ? answer.text : ""}
              onChange={(e) => {
                onChange({ taskId: task.id, kind: "short-text", text: e.target.value });
              }}
            />
          </label>
          
          <small className="hint-text">
            Строка из пробелов не считается заполненным ответом.
          </small>
        </div>
      )}
    </article>
  );
}