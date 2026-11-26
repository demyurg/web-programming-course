import type {
  Answer,
  AttemptResult,
  ResultItemStatus,
  Task,
} from "../domain";
import { findAnswer, formatAnswer, isAnswerFilled } from "../attempt";

type AttemptReviewProps = {
  tasks: Task[];
  answers: Answer[];
  editable: boolean;
  isBusy: boolean;
  result: AttemptResult | null;
  onClear: (taskId: string) => void;
};

function getItemStatusLabel(status: ResultItemStatus): string {
  switch (status) {
    case "correct":
      return "Верно";
    case "incorrect":
      return "Неверно";
    case "unanswered":
      return "Нет ответа";
    case "pending-review":
      return "Ожидает проверки";
  }
}

export function AttemptReview({
  tasks,
  answers,
  editable,
  isBusy,
  result,
  onClear,
}: AttemptReviewProps) {
  return (
    <section className="task-card">
      <h2>{result ? "Результат попытки" : "Обзор подтверждённых ответов"}</h2>

      {result && (
        <div className="result-summary">
          <p>
            <strong>Статус попытки:</strong> отправлена (submitted), редактирование закрыто
          </p>
          <p>
            <strong>Статус проверки:</strong>{" "}
            {result.status === "pending-review"
              ? "Ожидает проверки (pending-review)"
              : "Проверено (graded)"}
          </p>
          <p>
            <strong>Итоговый результат:</strong>{" "}
            {result.score === null
              ? "Ожидает проверки"
              : `${result.score} из ${result.maxScore}`}
          </p>
        </div>
      )}

      <ol className="review-list">
        {tasks.map((task, index) => {
          const answer = findAnswer(answers, task.id);
          const shown = formatAnswer(task, answer);
          const resultItem = result?.items.find((item) => item.taskId === task.id);

          return (
            <li key={task.id} className="review-item">
              <p className="review-prompt">{task.prompt}</p>
              <p className="review-answer">
                <strong>Ответ:</strong> {shown}
              </p>

              {resultItem && (
                <div className={`result-item status-${resultItem.status}`}>
                  <p>
                    <strong>Статус:</strong> {getItemStatusLabel(resultItem.status)}
                    {" · "}
                    <strong>Балл:</strong>{" "}
                    {resultItem.score === null
                      ? "Ожидает проверки"
                      : `${resultItem.score} / ${resultItem.maxScore}`}
                  </p>
                  <p>{resultItem.feedback}</p>
                </div>
              )}

              {editable && (
                <button
                  type="button"
                  className="action-button clear-button"
                  aria-label={"Очистить ответ на задание " + (index + 1)}
                  onClick={() => onClear(task.id)}
                  disabled={isBusy || !isAnswerFilled(answer)}
                >
                  Очистить ответ
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}