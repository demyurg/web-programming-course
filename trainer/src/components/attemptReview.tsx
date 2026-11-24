import { Task, Answer, AttemptResult, RequestState } from "../domain";

type AttemptReviewProps = {
  tasks: readonly Task[];
  confirmedAnswers: readonly Answer[];
  isSubmitted: boolean;
  result: AttemptResult | null;
  actionState: RequestState;
  onClearAnswer: (taskId: string) => void;
};

export function AttemptReview({
  tasks,
  confirmedAnswers,
  isSubmitted,
  result,
  actionState,
  onClearAnswer,
}: AttemptReviewProps) {
  const isLoading = actionState.status === "loading";

  return (
    <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
      <h3>{isSubmitted ? "Результат попытки" : "Обзор ответов"}</h3>

      {isSubmitted && result && (
        <div style={{ background: "#f0f8ff", padding: "12px", borderRadius: "6px", marginBottom: "15px", border: "1px solid #bae7ff" }}>
          <p style={{ margin: "0 0 5px 0" }}>
            <strong>Статус проверки:</strong>{" "}
            {result.status === "pending-review" ? "Ожидает ручной проверки" : "Проверено"}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Итоговый балл:</strong>{" "}
            {result.score === null ? (
              <span style={{ color: "#d48806", fontWeight: "bold" }}>Ожидает проверки (оценка ещё не выставлена)</span>
            ) : (
              <span>{result.score} из {result.maxScore}</span>
            )}
          </p>
        </div>
      )}

      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {tasks.map((task) => {
          const ans = confirmedAnswers.find((a) => a.taskId === task.id);
          const evalItem = result?.items?.find((item) => item.taskId === task.id);

          return (
            <li key={task.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{task.topic}:</strong>{" "}
                  {ans ? (
                    ans.kind === "single-choice" ? ans.optionId : ans.text
                  ) : (
                    <em style={{ color: "#888" }}>Нет ответа</em>
                  )}
                </div>

                {ans && !isSubmitted && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => onClearAnswer(task.id)}
                    style={{
                      color: isLoading ? "#999" : "red",
                      border: "1px solid currentColor",
                      background: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Удалить
                  </button>
                )}
              </div>

              {evalItem && (
                <div style={{ marginTop: "5px", fontSize: "0.9rem", color: "#555" }}>
                  Статус: <strong>{evalItem.status}</strong> {evalItem.feedback && `— ${evalItem.feedback}`}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
