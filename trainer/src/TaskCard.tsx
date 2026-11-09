import type { Task, Answer } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
};

export function TaskCard({ task, answer, onChange }: TaskCardProps) {
  return (
    <fieldset style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
      <legend style={{ fontWeight: "bold", fontSize: "1.1em" }}>
        {task.id} · {task.topic}
      </legend>
      
      <p>{task.prompt}</p>

      {task.code && (
        <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 4, overflow: "auto" }}>
          {task.code}
        </pre>
      )}

      {task.kind === "single-choice" && (
        <div role="radiogroup" aria-label={task.prompt}>
          {task.options.map((option) => (
            <label key={option.id} style={{ display: "block", margin: "8px 0", cursor: "pointer" }}>
              <input
                type="radio"
                name={`task-${task.id}`} // Группирует радио-кнопки по заданию
                value={option.id}
                checked={answer?.kind === "single-choice" && answer.optionId === option.id}
                onChange={() =>
                  onChange({ taskId: task.id, kind: "single-choice", optionId: option.id })
                }
              />
              {" "}{option.label}
            </label>
          ))}
        </div>
      )}

      {task.kind === "short-text" && (
        <label style={{ display: "block", marginTop: 12 }}>
          <span className="visually-hidden">Ваш ответ</span>
          <textarea
            value={answer?.kind === "short-text" ? answer.text : ""}
            onChange={(event) =>
              onChange({ taskId: task.id, kind: "short-text", text: event.target.value })
            }
            rows={5}
            style={{ width: "100%", fontFamily: "inherit", fontSize: "inherit" }}
            placeholder="Введите ответ..."
          />
        </label>
      )}
    </fieldset>
  );
}