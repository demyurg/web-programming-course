import type { Answer, Task } from "../domain";

type Props = {
  task: Task;
  answer: Answer | undefined;
  onChange: (next: Answer) => void;
};

export function AnswerField({ task, answer, onChange }: Props) {
  return (
    <article className="task-card">
      <header>
        <span className="task-card__id">{task.id}</span>
        <h2 className="task-card__prompt">{task.prompt}</h2>
        <span className="task-card__topic">{task.topic}</span>
      </header>

      {task.code !== undefined && (
        <pre className="task-card__code">{task.code}</pre>
      )}

      {task.kind === "single-choice" ? (
        <fieldset className="options">
          <legend>Выберите вариант ответа</legend>
          {task.options.map((option) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={task.id}
                checked={
                  answer?.kind === "single-choice" &&
                  answer.optionId === option.id
                }
                onChange={() =>
                  onChange({
                    taskId: task.id,
                    kind: "single-choice",
                    optionId: option.id,
                  })
                }
              />
              <span className="option__label">{option.label}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="textarea-wrap">
          <label htmlFor={`answer-${task.id}`}>Ваш ответ</label>
          <textarea
            id={`answer-${task.id}`}
            value={answer?.kind === "short-text" ? answer.text : ""}
            onChange={(event) =>
              onChange({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              })
            }
          />
        </div>
      )}
    </article>
  );
}