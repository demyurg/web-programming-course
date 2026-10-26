import type { Task, Answer } from "./domain";

type TaskCardFormProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
};

export function TaskCardForm({ task, answer, onChange }: TaskCardFormProps) {
  return (
    <section>
      <p>
        <small>Тема: {task.topic}</small>
      </p>
      <h2>{task.prompt}</h2>

      {task.code && <pre>{task.code}</pre>}

      {task.kind === "single-choice" ? (
        <fieldset>
          <legend>Выберите один вариант:</legend>
          
          {task.options.map((opt) => (
            <label key={opt.id} style={{ display: "block" }}>
              <input
                type="radio"
                name={task.id}
                value={opt.id}
                checked={
                  answer?.kind === "single-choice" && answer.optionId === opt.id // && - берется первое ложное выражение, если нет ложного - последнее
                }
                onChange={() =>
                  onChange({
                    taskId: task.id,
                    kind: "single-choice",
                    optionId: opt.id,
                  })
                }
              />
              {opt.label}
            </label>
          ))}

        </fieldset>
      ) : (
        <label style={{ display: "block" }}>
          Ваш ответ:
          <textarea
            value={answer?.kind === "short-text" ? answer.text : ""}
            onChange={(event) => // event - объект события React. Создается при вводе. Удаляется после того как React установит значение textarea в значение состояния
              onChange({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              })
            }
          />
        </label>
      )}
    </section>
  );
}