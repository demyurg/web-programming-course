import type { Task } from "./domain";

type TaskCardProps = {
    task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
    return (
        <article aria-label="Текущее задание">
            <p>Тема: {task.topic}</p>
            <h2>{task.prompt}</h2>
            {task.code !== undefined && (
                <pre><code>{task.code}</code></pre>
            )}
            {task.kind === "single-choice" ? (
                <ul>
                    {task.options.map((option) => (
                        <li key={option.id}>{option.label}</li>
                    ))}
                </ul>
            ) : (
                <p>Задание с коротким текстовым ответом.</p>
            )}
        </article>
    );
}
