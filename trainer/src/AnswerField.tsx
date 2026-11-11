import type { Answer, Task } from "./domain";

export type FormEvent =
  | { type: "choose"; taskId: string; optionId: string }
  | { type: "type"; taskId: string; text: string };

type AnswerFieldProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (event: FormEvent) => void;
  disabled: boolean;
};

export function AnswerField({
  task,
  answer,
  onChange,
  disabled,
}: AnswerFieldProps) {
  if (task.kind === "single-choice") {
    return (
      <fieldset disabled={disabled}>
        <legend>Выберите вариант</legend>
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
                onChange({
                  type: "choose",
                  taskId: task.id,
                  optionId: option.id,
                })
              }
            />{" "}
            {option.id}. {option.label}
          </label>
        ))}
      </fieldset>
    );
  }

  const fieldId = `answer-${task.id}`;

  return (
    <label htmlFor={fieldId}>
      Ваш ответ
      <textarea
        id={fieldId}
        value={answer?.kind === "short-text" ? answer.text : ""}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            type: "type",
            taskId: task.id,
            text: event.target.value,
          })
        }
      />
    </label>
  );
}
