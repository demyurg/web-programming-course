import type { Answer, Task } from "../domain";
import { isAnswerFilled } from "../domain";

type TaskReviewProps = {
  tasks: Task[];
  answers: Answer[];
  onClear?: (taskId: string) => void;
  onSelectTask?: (taskId: string) => void;
  disabled?: boolean;
};

export function TaskReview({ tasks, answers, onClear, onSelectTask, disabled }: TaskReviewProps) {
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
              const option = task.kind === "single-choice"
                ? task.options.find((o) => o.id === answer.optionId)
                : undefined;
              answerText = `Выбран вариант: ${option?.label ?? answer.optionId}`;
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
                    className="btn-secondary btn-sm"
                    disabled={disabled}
                  >
                    Перейти к заданию
                  </button>
                )}

                {onClear && answer && (
                  <button 
                    onClick={() => onClear(task.id)}
                    className="btn-secondary btn-sm"
                    disabled={disabled}
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