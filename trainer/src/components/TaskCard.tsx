import type { Answer, Task } from "../domain";

type TaskCardProps = {
  task: Task;
  answer?: Answer;
  onAnswerChange?: (answer: Answer) => void;
  readOnly?: boolean;
};

export function TaskCard({
  task,
  answer,
  onAnswerChange,
  readOnly = false,
}: TaskCardProps) {
  const handleSingleChoiceChange = (optionId: string) => {
    if (readOnly || !onAnswerChange) {
      return;
    }
    onAnswerChange({
      taskId: task.id,
      kind: "single-choice",
      optionId,
    });
  };

  const handleShortTextChange = (text: string) => {
    if (readOnly || !onAnswerChange) {
      return;
    }
    onAnswerChange({
      taskId: task.id,
      kind: "short-text",
      text,
    });
  };

  const selectedOptionId =
    answer && answer.kind === "single-choice" ? answer.optionId : undefined;

  const shortTextValue =
    answer && answer.kind === "short-text" ? answer.text : "";

  return (
    <article className="task-card">
      <p>Тема: {task.topic}</p>
      <h2>{task.prompt}</h2>
      {task.code !== undefined && <pre>{task.code}</pre>}
      {task.kind === "single-choice" ? (
        <div className="task-options">
          {task.options.map((option) => (
            <label key={option.id} className="task-option">
              <input
                type="radio"
                name={task.id}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => handleSingleChoiceChange(option.id)}
                disabled={readOnly}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="task-text">
          <textarea
            value={shortTextValue}
            onChange={(e) => handleShortTextChange(e.target.value)}
            disabled={readOnly}
            placeholder="Введите ответ..."
            rows={4}
          />
        </div>
      )}
    </article>
  );
}
