import type { Answer, Progress, Task } from "./domain";
import { isAnswerFilled } from "./domain";
import type { ServerResult } from "./api/trainerApi";

type ReviewProps = {
  tasks: Task[];
  answers: Record<string, Answer>;
  progress: Progress;
  submitted: boolean;
  result?: ServerResult;
  onClear: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onRestart: () => void;
  isActionLoading: boolean;
};

function describeAnswer(task: Task, answer: Answer | undefined): string {
  if (answer === undefined || !isAnswerFilled(answer)) return "Пропущено";
  if (task.kind === "single-choice" && answer.kind === "single-choice") {
    const option = task.options.find((item) => item.id === answer.optionId);
    return option === undefined ? answer.optionId : `${option.id}) ${option.label}`;
  }
  if (answer.kind === "short-text") return answer.text;
  return "Пропущено";
}

export function Review({
  tasks,
  answers,
  progress,
  submitted,
  result,
  onClear,
  onOpenTask,
  onRestart,
  isActionLoading,
}: ReviewProps) {
  return (
    <section className="review">
      <h2>{submitted ? "Попытка завершена" : "Обзор ответов"}</h2>
      
      {submitted && result ? (
        <div style={{ marginBottom: 20, padding: 16, background: "#f7f7f7", borderRadius: 12 }}>
          {result.status === "pending-review" ? (
            <h3>Статус: Ожидает проверки</h3>
          ) : (
            <h3>Результат: {result.score} из {result.maxScore}</h3>
          )}
          {result.status === "pending-review" && (
            <p style={{ color: "var(--muted)" }}>
              Некоторые задания с текстовым ответом требуют ручной проверки.
            </p>
          )}
        </div>
      ) : (
        <p>Заполнено: {progress.answered} из {progress.total}</p>
      )}

      <ol>
        {tasks.map((task) => {
          const serverItem = result?.items.find((i) => i.taskId === task.id);
          
          return (
            <li key={task.id} style={{ marginBottom: 20 }}>
              <p>
                <strong>{task.id}:</strong> {task.prompt}
              </p>
              <p className="review-answer" style={{ marginTop: 4, marginBottom: 4 }}>
                <em>Ваш ответ:</em> {describeAnswer(task, answers[task.id])}
              </p>
              
              {/* Если попытка завершена, показываем серверный фидбек */}
              {submitted && serverItem && (
                <div style={{ padding: 8, background: "#f0f7ff", borderRadius: 8, fontSize: 14 }}>
                  <span>Статус: <strong>{serverItem.status}</strong>. </span>
                  <span>Балл: <strong>{serverItem.score === null ? "Ожидает проверки" : serverItem.score}</strong> из {serverItem.maxScore}. </span>
                  <span>{serverItem.feedback}</span>
                </div>
              )}

              {!submitted && (
                <div className="review-actions" style={{ marginTop: 8 }}>
                  <button type="button" onClick={() => onOpenTask(task.id)} disabled={isActionLoading}>
                    Изменить
                  </button>
                  <button
                    type="button"
                    disabled={answers[task.id] === undefined || isActionLoading}
                    onClick={() => onClear(task.id)}
                  >
                    Очистить
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      
      {submitted && (
        <button type="button" className="finish" onClick={onRestart} disabled={isActionLoading}>
          {isActionLoading ? "Загрузка..." : "Начать новую попытку"}
        </button>
      )}
    </section>
  );
}