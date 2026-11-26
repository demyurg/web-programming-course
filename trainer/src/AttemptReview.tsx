import type { AttemptResult } from "./api/trainerApi";
import { findAnswer, isAnswered, type Answer, type Task } from "./domain";

type AttemptReviewProps = {
  tasks: Task[];
  answers: Answer[];
  result: AttemptResult | null;
  canEdit: boolean;
  busy: boolean;
  onClear: (taskId: string) => void;
  onBack: () => void;
  onFinish: () => void;
  onRestart: () => void;
};

function formatAnswer(task: Task, answer: Answer | undefined): string {
  if (!isAnswered(answer) || !answer) return "нет ответа";
  if (answer.kind === "short-text") return answer.text;
  if (task.kind !== "single-choice") return answer.optionId;
  const option = task.options.find((item) => item.id === answer.optionId);
  return option ? `${option.id}. ${option.label}` : answer.optionId;
}

function statusText(status: AttemptResult["items"][number]["status"]): string {
  if (status === "correct") return "верно";
  if (status === "incorrect") return "неверно";
  if (status === "unanswered") return "нет ответа";
  return "ожидает проверки";
}

function scoreText(score: number | null): string {
  if (score === null) return "ожидает проверки";
  return String(score);
}

export function AttemptReview({
  tasks,
  answers,
  result,
  canEdit,
  busy,
  onClear,
  onBack,
  onFinish,
  onRestart,
}: AttemptReviewProps) {
  return (
    <>
      <h2>{canEdit ? "Обзор ответов" : "Попытка завершена"}</h2>
      {!canEdit ? (
        <p>Попытка в статусе submitted. Редактирование закрыто.</p>
      ) : null}
      {result ? (
        <>
          <p>
            Результат сервера:{" "}
            {result.status === "pending-review"
              ? "pending-review, проверка ещё не закончена"
              : "graded, проверка закончена"}
            . Баллы: {scoreText(result.score)}
            {result.score === null ? "" : ` из ${result.maxScore}`}
          </p>
        </>
      ) : null}
      <ul>
        {tasks.map((task) => {
          const item = result?.items.find((entry) => entry.taskId === task.id);
          return (
            <li key={task.id}>
              <p>
                {task.id}: {formatAnswer(task, findAnswer(answers, task.id))}
              </p>
              {item ? (
                <p>
                  {statusText(item.status)}. Балл: {scoreText(item.score)}.{" "}
                  {item.feedback}
                </p>
              ) : null}
              {canEdit ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onClear(task.id)}
                >
                  Удалить
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p>
        {canEdit ? (
          <>
            <button type="button" disabled={busy} onClick={onBack}>
              К заданиям
            </button>{" "}
            <button type="button" disabled={busy} onClick={onFinish}>
              Завершить
            </button>
          </>
        ) : (
          <button type="button" disabled={busy} onClick={onRestart}>
            Новая попытка
          </button>
        )}
      </p>
    </>
  );
}
