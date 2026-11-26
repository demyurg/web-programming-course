import type { Answer, Task } from "./domain";

type TaskCardProps = {
    task: Task;
    answer: Answer | undefined;
    onAnswerChange: (answer: Answer) => void;
};

export function TaskCard({ task, answer, onAnswerChange }: TaskCardProps) {
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
        </article>
    );
}
