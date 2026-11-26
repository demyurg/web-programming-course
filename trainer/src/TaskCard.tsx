import type { Answer, Task } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  disabled: boolean;
};

export default function TaskCard({
  task,
  answer,
  onAnswerChange,
  disabled,
}: TaskCardProps) {
  return (
    <section>
      <h2>Выбранное задание</h2>
      <p>Тема: {task.topic}</p>
      <p>{task.prompt}</p>

      {task.code && (
        <pre>
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <ul>
          {task.options.map((option) => (
            <li key={option.id}>
              <label>
                <input
                  type="radio"
                  name={task.id}
                  value={option.id}
                  checked={
                    answer?.kind === "single-choice" &&
                    answer.optionId === option.id
                  }
                  onChange={() =>
                    onAnswerChange({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option.id,
                    })
                  }
                  disabled={disabled}
                />
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <textarea
          value={answer?.kind === "short-text" ? answer.text : ""}
          onChange={(event) =>
            onAnswerChange({
              taskId: task.id,
              kind: "short-text",
              text: event.target.value,
            })
          }
          placeholder="Введи тут ответ..."
          disabled={disabled}
        />
      )}
    </section>
  );
}