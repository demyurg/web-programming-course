import type { Answer, Task } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  onClear: (taskId: string) => void;
};

export function TaskCard({ task, answer, onAnswer, onClear }: TaskCardProps) {
  return (
    <article className="task-card">
      <p>Тема: {task.topic}</p>
      <h2>{task.prompt}</h2>

      {task.code !== undefined && <pre>{task.code}</pre>}

            {task.kind === "single-choice" ? (
        <fieldset>
          <legend>Выберите один вариант</legend>
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
                  onAnswer({
                    taskId: task.id,
                    kind: "single-choice",
                    optionId: option.id,
                  })
                }
              />
              {option.id}) {option.label}
            </label>
          ))}
        </fieldset>
      ) : (
        <label className="text-answer">
          Ваш ответ
          <textarea
            rows={5}
            value={answer?.kind === "short-text" ? answer.text : ""}
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
      <button
        type="button"
        className="clear"
        disabled={answer === undefined}
        onClick={() => onClear(task.id)}
      >
        Очистить ответ
      </button>
    </article>
  );
}
