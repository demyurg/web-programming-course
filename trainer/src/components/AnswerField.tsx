import type { Answer, Task } from "../domain";

type Props = {
  task: Task;
  answer: Answer | undefined;
  onChange: (next: Answer) => void;
};

export function AnswerField({ task, answer, onChange }: Props) {
  if (task.kind === "single-choice") {
    return (
      <fieldset>
        <legend>{task.prompt}</legend>
        {task.code && <pre>{task.code}</pre>}
        {task.options.map((opt) => (
          <label key={opt.id}>
            <input
              type="radio"
              name={task.id}
              checked={answer?.kind === "single-choice" && answer.optionId === opt.id}
              onChange={() =>
                onChange({ taskId: task.id, kind: "single-choice", optionId: opt.id })
              }
            />
            {opt.label}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <div>
      <label htmlFor={task.id}>{task.prompt}</label>
      {task.code && <pre>{task.code}</pre>}
      <textarea
        id={task.id}
        value={answer?.kind === "short-text" ? answer.text : ""}
        onChange={(event) =>
          onChange({ taskId: task.id, kind: "short-text", text: event.target.value })
        }
      />
    </div>
  );
}