import type { Task, Answer } from "../domain";

type Props = {
  task: Task;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  onDelete: () => void;
};

export function TaskCard({ task, answer, onChange, onDelete }: Props) {
  return (
    <div className="card">
      <h2>{task.prompt}</h2>
      <p style={{ color: "#666" }}>Тема: {task.topic}</p>

      {task.code !== undefined && (
        <pre><code>{task.code}</code></pre>
      )}

      {task.kind === "single-choice" ? (
        <fieldset style={{ marginTop: "20px" }}>
          <legend>Выберите один вариант:</legend>
          {task.options.map((option) => (
            <label key={option.id}>
              <input
                type="radio"
                name={task.id}
                checked={answer?.kind === "single-choice" && answer.optionId === option.id}
                onChange={() => onChange({ taskId: task.id, kind: "single-choice", optionId: option.id })}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <label htmlFor={`text-${task.id}`} style={{ fontWeight: "bold" }}>Ваш ответ:</label>
          <textarea
            id={`text-${task.id}`}
            value={answer?.kind === "short-text" ? answer.text : ""}
            onChange={(e) => onChange({ taskId: task.id, kind: "short-text", text: e.target.value })}
            placeholder="Введите ответ..."
          />
        </div>
      )}

      {/* Кнопка очистки ответа */}
      {answer && (
        <button 
          onClick={onDelete} 
          style={{ marginTop: "10px", background: "#dc3545", fontSize: "14px" }}
        >
          Очистить ответ
        </button>
      )}
    </div>
  );
}