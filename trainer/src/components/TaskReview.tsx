import type { Answer, Task } from "../domain";
import { isAnswerFilled } from "../domain";

type TaskReviewProps = {
  tasks: Task[];
  answers: Answer[];
  onClear?: (taskId: string) => void;
  onSelectTask?: (taskId: string) => void;
};

export function TaskReview({ tasks, answers, onClear, onSelectTask }: TaskReviewProps) {
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Обзор ответов:</h3>
      <ul className="review-list">
        {tasks.map((task) => {
          const answer = answers.find((a) => a.taskId === task.id);
          const filled = answer !== undefined && isAnswerFilled(answer, task);

          let answerText = "Нет ответа";
          if (answer) {
            if (answer.kind === "single-choice") {
              answerText = `Выбран вариант: ${answer.optionId}`;
            } else {
              answerText = `Текст: "${answer.text}"`;
            }
          }

          return (
            <li key={task.id} className="review-item">
              <strong>{task.id}</strong>: {task.prompt}
              <br />
              <span className={`review-status ${filled ? "filled" : "empty"}`}>
                {filled ? "Заполнено" : "Пропущено"}
              </span>
              <br />
              <span>{answerText}</span>
              
              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                {onSelectTask && (
                  <button 
                    onClick={() => onSelectTask(task.id)}
                    className="btn-secondary"
                    style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                  >
                    Перейти к заданию
                  </button>
                )}

                {onClear && answer && (
                  <button 
                    onClick={() => onClear(task.id)}
                    className="btn-secondary"
                    style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                  >
                    Очистить
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}