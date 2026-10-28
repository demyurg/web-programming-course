import type { Answer, Task } from "../domain";

type TaskCardProps = { task: Task; answer: Answer | undefined; onAnswer: (answer: Answer) => void; disabled: boolean };

export default function TaskCard({ task, answer, onAnswer, disabled }: TaskCardProps) {
  return (
    <article className="task-card" aria-labelledby="task-prompt">
      <div className="card-meta"><span className="topic-badge">{task.topic}</span><span>{task.kind === "single-choice" ? "Один вариант" : "Короткий текст"}</span></div>
      <h2 id="task-prompt">{task.prompt}</h2>
      {task.code !== undefined && <div className="code-block"><p>Фрагмент кода</p><pre><code>{task.code}</code></pre></div>}
      {task.kind === "single-choice" ? (
        <fieldset className="options" disabled={disabled}><legend>Выберите ответ</legend>
          {task.options.map((option) => <label className="option" key={option.id}>
            <input type="radio" name={task.id} value={option.id} checked={answer?.kind === "single-choice" && answer.optionId === option.id} onChange={() => onAnswer({ taskId: task.id, kind: "single-choice", optionId: option.id })} />
            <span className="option-id">{option.id}</span><span>{option.label}</span>
          </label>)}
        </fieldset>
      ) : <div className="text-field"><label htmlFor="answer-text">Ваш ответ</label><textarea id="answer-text" rows={6} disabled={disabled} value={answer?.kind === "short-text" ? answer.text : ""} onChange={(event) => onAnswer({ taskId: task.id, kind: "short-text", text: event.target.value })} placeholder="Напишите ответ своими словами" /></div>}
    </article>
  );
}
