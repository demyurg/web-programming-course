import {
  answersEqual,
  getAnswer,
  isAnswered,
  type Answer,
  type AttemptResult,
  type Task,
} from "../domain";

type AttemptReviewProps = {
  tasks: Task[];
  answers: Answer[];
  confirmedAnswers: Answer[];
  submitted: boolean;
  canClear: boolean;
  result: AttemptResult | null;
  onClear: (taskId: string) => void;
};

function answerText(answer: Answer | undefined): string {
  if (answer === undefined || !isAnswered(answer)) {
    return "нет ответа";
  }

  if (answer.kind === "single-choice") {
    return "вариант " + answer.optionId;
  }

  return answer.text;
}

function scoreText(score: number | null): string {
  if (score === null) {
    return "ожидает проверки";
  }

  return String(score);
}

function statusText(status: string): string {
  if (status === "correct") return "верно";
  if (status === "incorrect") return "неверно";
  if (status === "unanswered") return "нет ответа";
  if (status === "pending-review") return "ожидает проверки";
  if (status === "graded") return "проверено";
  return status;
}

export function AttemptReview({
  tasks,
  answers,
  confirmedAnswers,
  submitted,
  canClear,
  result,
  onClear,
}: AttemptReviewProps) {
  return (
    <section>
      <h2>Обзор попытки</h2>
      <p>
        {submitted
          ? "Попытка завершена. Ответы можно только просматривать."
          : "До завершения видны ответы всей попытки. Локальный ввод и подтверждение сервера показаны отдельно."}
      </p>
      <ul>
        {tasks.map((task) => {
          const local = getAnswer(answers, task.id);
          const saved = getAnswer(confirmedAnswers, task.id);
          const same = answersEqual(local, saved);

          return (
            <li key={task.id}>
              {task.id}: {answerText(local)}
              {same
                ? " (совпадает с сервером)"
                : " (на сервере: " + answerText(saved) + ")"}
              {canClear ? (
                <>
                  {" "}
                  <button type="button" onClick={() => onClear(task.id)}>
                    Очистить
                  </button>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
      {result ? (
        <div>
          <h3>Результат сервера</h3>
          <p>
            Статус: {statusText(result.status)}. Балл: {scoreText(result.score)} из{" "}
            {result.maxScore}
          </p>
          <ul>
            {result.items.map((item) => (
              <li key={item.taskId}>
                {item.taskId}: {statusText(item.status)}, балл {scoreText(item.score)} из{" "}
                {item.maxScore}. {item.feedback}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
