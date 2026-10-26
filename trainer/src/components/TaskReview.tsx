import type { Answer, Task } from "../domain";
import { isAnswerFilled } from "../domain";

type TaskReviewProps = {
  tasks: Task[];
  answers: Answer[];
};

export function TaskReview({ tasks, answers }: TaskReviewProps) {
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}