import type { Answer, Task } from "../domain.js";
import type { AttemptResult } from "../api.js";

type AttemptReviewProps = {
  tasks: readonly Task[];
  answers: readonly Answer[];
  result: AttemptResult;
  onRestart: () => void;
};

export function AttemptReview({
  tasks,
  answers,
  result,
  onRestart,
}: AttemptReviewProps) {
  return (
    <div className="review">
      <h2 className="review-title">Попытка завершена</h2>
      <div className="result-box">
        <p>
          Статус сервера:{" "}
          {result.status === "pending-review"
            ? "pending-review — ожидает проверки преподавателя"
            : `${result.status} — попытка проверена`}
        </p>
        <p>
          {result.score === null
            ? "Оценка: null — ожидает проверки (это не ноль)"
            : `Оценка: ${result.score} / ${result.maxScore}`}
        </p>
      </div>
      {tasks.length > 0 ? (
        <ul className="review-list">
          {tasks.map((task, index) => {
            const answer = answers.find((a) => a.taskId === task.id);
            const item = result.items.find((i) => i.taskId === task.id);
            return (
              <li key={task.id} className="review-item">
                <p className="review-item-question">
                  {index + 1}. {task.question}
                </p>
                <div className="review-item-answer">
                  {answer?.kind === "single-choice" &&
                  task.kind === "single-choice" ? (
                    <span>
                      Вариант:{" "}
                      {task.options.find((o) => o.id === answer.optionId)
                        ?.text ?? "—"}
                    </span>
                  ) : answer?.kind === "short-text" ? (
                    <span>
                      Ответ: {answer.text.trim() !== "" ? answer.text : "—"}
                    </span>
                  ) : (
                    <span className="review-item-empty">
                      Ответ не был сохранён
                    </span>
                  )}
                  {item && (
                    <span>
                      {" "}
                      (статус: {item.status}
                      {item.score !== null
                        ? `, баллов: ${item.score}/${item.maxScore}`
                        : ", ожидает проверки"}
                      )
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="screen-note">
          Сервер не возвращает список заданий; результат загружен по id попытки.
        </p>
      )}
      <button type="button" className="review-restart" onClick={onRestart}>
        Новая попытка
      </button>
    </div>
  );
}
