import type { Answer, TrainingSet } from "./domain";

type ReviewListProps = {
  set: TrainingSet;
  answers: Answer[];
};

export function ReviewList({ set, answers }: ReviewListProps) {
  return (
    <ol>
      {set.tasks.map((task) => {
        const answer = answers.find((a) => a.taskId === task.id);
        // Явный return, так как в стрелочной функции используется блок, а не выражение. Выражение - (), Блок - {}. Для выражения return - неявный
        return (
          <li key={task.id}>
            <p>
              <strong>{task.prompt}</strong>
            </p>
            {!answer ? (
              <p>Нет ответа</p>
            ) : answer.kind === "single-choice" ? (
              <p>
                Выбран вариант:{" "}
                {task.kind === "single-choice" // Если объект перед ?. - undefined или null - обращение к полю label не будет. Нужно для предотвращения ошибки
                  ? (task.options.find((o) => o.id === answer.optionId)?.label ?? // ?? - Вернет правый операнд только если слева null или undefined
                    "неизвестный вариант")
                  : "—"}
              </p>
            ) : (
              <p>Ответ: {answer.text.trim() || "пусто"}</p> // || - Логическое ИЛИ
            )}
          </li>
        );
      })}
    </ol>
  );
}