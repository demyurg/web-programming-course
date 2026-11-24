import type { TrainingSet } from "../domain";
import type { AttemptResultData } from "../api/attempts";

type AttemptResultProps = {
  set: TrainingSet;
  result: AttemptResultData;
  onRestart: () => void;
};

export function AttemptResult({ set, result, onRestart }: AttemptResultProps) {
  return (
    <main>
      <h1>{set.title}</h1>
      <h2>Попытка завершена</h2>
      <p>
        Статус:{" "}
        <strong>
          {result.status === "pending-review" ? "Ожидает проверки" : "Проверено"}
        </strong>
        {result.status === "graded" && (
          <> — {result.score} из {result.maxScore}</>
        )}
      </p>
      
      <ul className="review-list">
        {result.items.map((item) => {
          const task = set.tasks.find((t) => t.id === item.taskId);
          if (!task) return null;

          let label = "Нет ответа";
          if (item.status === "pending-review") {
            label = "Ожидает проверки";
          } else if (item.status === "correct") {
            label = "Верно";
          } else if (item.status === "incorrect") {
            label = "Неверно";
          } else if (item.status === "unanswered") {
            label = "Пропущено (0 баллов)";
          }

          return (
            <li key={item.taskId} className="review-item">
              <strong>{item.taskId}</strong>: {task.prompt}
              <br />
              <span>{label}</span>
              {item.feedback && (
                <>
                  <br />
                  <small>Комментарий: {item.feedback}</small>
                </>
              )}
            </li>
          );
        })}
      </ul>
      
      <button onClick={onRestart} className="btn-primary" style={{ marginTop: 20 }}>
        Начать новую попытку
      </button>
    </main>
  );
}