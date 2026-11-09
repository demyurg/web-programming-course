import type { Task, Answer } from "./domain";

type TaskCardProps = {
  task: Task | undefined;
  answer: Answer | undefined; // Текущий ответ на это задание
  onChange: (newAnswer: Answer) => void; // Функция обновления ответа
  disabled: boolean; // Флаг: завершена ли попытка (блокировка полей)
};

export function TaskCard({ task, answer, onChange, disabled }: TaskCardProps) {
  if (!task) {
    return (
      <section className="task-card task-card--empty">
        <p>Задание не выбрано.</p>
      </section>
    );
  }

  return (
    <section className="task-card">
      <header className="task-card__header">
        <span className="task-card__topic">{task.topic}</span>
        <span className="task-card__id">{task.id}</span>
      </header>

      <p className="task-card__prompt">{task.prompt}</p>

      {task.code !== undefined && (
        <pre className="task-card__code">{task.code}</pre>
      )}

      {task.kind === "single-choice" ? (
        <fieldset className="task-card__options" disabled={disabled}>
          <legend>Выберите вариант:</legend>
          {task.options.map((option) => {
            // Проверяем, выбран ли этот вариант
            const isChecked = answer?.kind === "single-choice" && answer.optionId === option.id;
            
            return (
              <label key={option.id} className="task-card__option-label">
                <input
                  type="radio"
                  name={`task-${task.id}`} // Группируем радиокнопки по ID задания
                  checked={isChecked}
                  onChange={() =>
                    onChange({ taskId: task.id, kind: "single-choice", optionId: option.id })
                  }
                />
                {option.label}
              </label>
            );
          })}
        </fieldset>
      ) : (
        <fieldset className="task-card__text-answer" disabled={disabled}>
          <legend>Ваш ответ:</legend>
          <textarea
            value={answer?.kind === "short-text" ? answer.text : ""}
            onChange={(e) =>
              onChange({ taskId: task.id, kind: "short-text", text: e.target.value })
            }
            placeholder="Введите текст..."
            rows={4}
          />
        </fieldset>
      )}
    </section>
  );
}