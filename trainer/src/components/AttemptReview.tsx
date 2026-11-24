import type { Result } from "../attempt";
import type { Answer, Task } from "../domain";

type Props = {
  tasks: Task[];
  answers: ReadonlyMap<string, Answer>;
  dirtyIds: ReadonlyMap<string, Answer>;
  filledIds: ReadonlySet<string>;
  result: Result | null;
  canEdit: boolean;
  busy: boolean;
  onClear: (taskId: string) => void;
};

const resultLabels = {
  correct: "Верно",
  incorrect: "Неверно",
  unanswered: "Нет ответа",
  "pending-review": "Ожидает проверки",
};

function answerLabel(task: Task, answer: Answer | undefined) {
  if (answer?.kind === "short-text") return answer.text;
  if (task.kind === "single-choice" && answer?.kind === "single-choice") {
    return task.options.find(({ id }) => id === answer.optionId)?.label;
  }
}

export default function AttemptReview({ tasks, answers, dirtyIds, filledIds, result, canEdit, busy, onClear }: Props) {
  const resultItems = new Map(result?.items.map((item) => [item.taskId, item]));
  return (
    <section className="review" aria-labelledby="review-title">
      <h2 id="review-title">Обзор ответов</h2>
      {result && (
        <p role="status">
          {result.score === null ? "Результат ожидает проверки." : `Результат: ${result.score} из ${result.maxScore}.`}
        </p>
      )}
      {tasks.map((task, index) => {
        const answer = answers.get(task.id);
        const item = resultItems.get(task.id);
        return (
          <article className="review-item" key={task.id}>
            <h3>{index + 1}. {task.prompt}</h3>
            <p className="review-answer">{filledIds.has(task.id) ? answerLabel(task, answer) : "Нет ответа"}</p>
            {dirtyIds.has(task.id) && <p>Изменения не сохранены на сервере.</p>}
            {item && (
              <p>{resultLabels[item.status]}{item.score === null ? "" : ` · ${item.score} из ${item.maxScore}`}. {item.feedback}</p>
            )}
            {canEdit && answer && (
              <button type="button" disabled={busy} onClick={() => onClear(task.id)}>
                Очистить ответ к заданию {index + 1}
              </button>
            )}
          </article>
        );
      })}
    </section>
  );
}
