import type { Answer, Task } from "./domain";

type TaskCardProps = {
    task: Task;
    answer: Answer | undefined;
    onAnswerChange: (answer: Answer) => void;
    onAnswerClear: (taskId: string) => void;
    disabled?: boolean;
};

export function TaskCard({ task, answer, onAnswerChange, onAnswerClear, disabled = false }: TaskCardProps) {
    return (
        <article aria-label="Текущее задание">
            <p>Тема: {task.topic}</p>
            <h2>{task.prompt}</h2>
            {task.code !== undefined && (
                <pre><code>{task.code}</code></pre>
            )}
            {task.kind === "single-choice" ? (
                <fieldset>
                    <legend>Выберите один ответ</legend>
                    {task.options.map((option) => (
                        <label className="option" key={option.id}>
                            <input
                                type="radio"
                                disabled={disabled}
                                name={task.id}
                                checked={answer?.kind === "single-choice" && answer.optionId === option.id}
                                onChange={() => onAnswerChange({
                                    taskId: task.id,
                                    kind: "single-choice",
                                    optionId: option.id,
                                })}
                            />
                            {option.label}
                        </label>
                    ))}
                </fieldset>
            ) : (
                <label className="text-answer">
                    Короткий ответ
                    <textarea
                        disabled={disabled}
                        value={answer?.kind === "short-text" ? answer.text : ""}
                        onChange={(event) => onAnswerChange({
                            taskId: task.id,
                            kind: "short-text",
                            text: event.target.value,
                        })}
                        rows={5}
                    />
                </label>
            )}
            {answer && (
                <button type="button" disabled={disabled} onClick={() => onAnswerClear(task.id)}>
                    Очистить ответ
                </button>
            )}
        </article>
    );
}
