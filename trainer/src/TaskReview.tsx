import type { Answer, TrainingSet } from "./domain";
import { getProgress, isAnswerFilled } from "./domain";
import { getUnansweredTasks } from "./attempt";

type TaskReviewProps = {
  set: TrainingSet;
  answers: Answer[];
  onClear?: (taskId: string) => void;
  onSelectTask?: (taskId: string) => void;
};

export default function TaskReview({
  set,
  answers,
  onClear,
  onSelectTask,
}: TaskReviewProps) {
  const progress = getProgress(set, answers);
  const unanswered = getUnansweredTasks(set, answers);

  return (
    <div>
      <p>
        <strong>Заполнено:</strong> {progress.filled} из {progress.total}
      </p>
      <p>
        <strong>Пропуски:</strong>{" "}
        {unanswered.length > 0
          ? unanswered.map((t) => t.id).join(", ")
          : "нет"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
        {set.tasks.map((task) => {
          const ans = answers.find((a) => a.taskId === task.id);
          const filled = isAnswerFilled(task, ans);

          let ansText = "Нет ответа";
          if (ans?.kind === "single-choice") {
            const opt =
              task.kind === "single-choice"
                ? task.options.find((o) => o.id === ans.optionId)
                : null;
            ansText = opt ? opt.label : ans.optionId;
          } else if (ans?.kind === "short-text") {
            ansText =
              ans.text.trim().length > 0
                ? ans.text
                : "Пустой текст (только пробелы)";
          }

          return (
            <div
              key={task.id}
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>
                  [{task.id}] {task.topic}:
                </strong>{" "}
                {task.prompt}
              </p>

              <p
                style={{
                  marginTop: "8px",
                  marginBottom: "4px",
                  color: filled ? "#15803d" : "#b91c1c",
                  fontWeight: "bold",
                }}
              >
                {filled ? "Заполнено" : "Пропущено"}
              </p>

              <p style={{ margin: "4px 0 0", color: "#244a7c" }}>
                Ваш ответ: {ansText}
              </p>

              {(onSelectTask || (onClear && ans)) && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  {onSelectTask && (
                    <button type="button" onClick={() => onSelectTask(task.id)}>
                      Перейти к заданию
                    </button>
                  )}

                  {onClear && ans && (
                    <button type="button" onClick={() => onClear(task.id)}>
                      Очистить ответ
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}