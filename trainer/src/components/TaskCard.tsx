import type { Answer, Task } from "../domain.js";

type TaskFormProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
};

function TaskForm({ task, answer, onChange }: TaskFormProps) {
  if (task.kind === "single-choice") {
    return (
      <fieldset className="task-form">
        <legend className="task-form-legend">Выберите один вариант:</legend>
        <ul className="task-form-options">
          {task.options.map((option) => (
            <li key={option.id}>
              <label className="task-form-label">
                <input
                  type="radio"
                  name={task.id}
                  value={option.id}
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
                <span className="task-form-option-text">{option.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    );
  }

  return (
    <div className="task-form">
      <label className="task-form-label" htmlFor={`text-${task.id}`}>
        Введите короткий ответ:
        <textarea
          id={`text-${task.id}`}
          className="task-form-textarea"
          rows={4}
          value={answer?.kind === "short-text" ? answer.text : ""}
          onChange={(event) =>
            onChange({
              taskId: task.id,
              kind: "short-text",
              text: event.target.value,
            })
          }
        />
      </label>
    </div>
  );
}

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
};

export function TaskCard({ task, answer, onChange }: TaskCardProps) {
  return (
    <article className="task-card">
      <header className="task-card-header">
        <span className="task-card-topic">{task.topic}</span>
        <span className="task-card-kind">{task.kind}</span>
      </header>
      <h2 className="task-card-question">{task.question}</h2>
      {task.code !== undefined && (
        <pre className="task-card-code">
          <code>{task.code}</code>
        </pre>
      )}
      <TaskForm task={task} answer={answer} onChange={onChange} />
    </article>
  );
}
