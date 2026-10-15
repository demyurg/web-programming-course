import type { Task } from "./domain";

type TaskCardProps = {
  task: Task | undefined;
};

// В качестве props компонента указан деструктуризованный тип TaskCardProps (по сути объкт типа Task)
export function TaskCard({ task }: TaskCardProps) {
  if (!task) {
    return (
      <section>
        <p>Выберите задание из списка.</p>
      </section>
    );
  }

  return (
    <section>
      <p>
        <small>Тема: {task.topic}</small>
      </p>
      <h2>{task.prompt}</h2>

      {task.code && <pre>{task.code}</pre>}

      {task.kind === "single-choice" ? (
        <ul>
          {task.options.map((opt) => (
            <li key={opt.id}>{opt.label}</li>
          ))}
        </ul>
      ) : (
        <p>Это текстовое задание. Введите ответ словами.</p>
      )}
    </section>
  );
}