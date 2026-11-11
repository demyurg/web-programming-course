import type { Answer, FormEvent, Task } from "./domain";

type AnswerFieldProps = {
  task: Task;
  answer: Answer | undefined;
  disabled: boolean;
  onFormEvent: (event: FormEvent) => void;
};

export function AnswerField({
  task,
  answer,
  disabled,
  onFormEvent,
}: AnswerFieldProps) {
  if (task.kind === "single-choice") {
    return (
      <fieldset disabled={disabled}>
        <legend>Варианты ответа</legend>
        {task.options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name={task.id}
              checked={
                answer?.kind === "single-choice" &&
                answer.optionId === option.id
              }
              onChange={() =>
                onFormEvent({
                  type: "choose-option",
                  taskId: task.id,
                  optionId: option.id,
                })
              }
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <label>
      Ваш ответ
      <textarea
        value={answer?.kind === "short-text" ? answer.text : ""}
        disabled={disabled}
        onChange={(event) =>
          onFormEvent({
            type: "change-text",
            taskId: task.id,
            text: event.target.value,
          })
        }
      />
    </label>
  );
}
