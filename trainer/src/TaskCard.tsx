import type { Task } from "./domain";

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
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
            <li key={option.id}>{option.label}</li>
          ))}
        </ul>
      ) : (
        <p>Задание с текстовым ответом.</p>
      )}
    </section>
  );
}