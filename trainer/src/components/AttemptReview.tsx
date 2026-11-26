import type { Answer, TrainingSet } from "../domain";
import { countProgress } from "../domain";
import { findAnswer } from "../attempt";
import {
  describeAnswer,
  describeItemStatus,
  describeResultStatus,
  findResultItem,
  formatScore,
} from "../format";
import type { Result } from "../server-model";

type AttemptReviewProps = {
  set: TrainingSet;
  answers: Answer[];
  result: Result | null; 
  editable: boolean;
  busy: boolean;
  canClear: (taskId: string) => boolean;
  onClear: (taskId: string) => void;
};

export function AttemptReview({
  set,
  answers,
  result,
  editable,
  busy,
  canClear,
  onClear,
}: AttemptReviewProps) {
  const progress = countProgress(set, answers);

  return (
    <section className="overview">
      <h2>{result === null ? "Обзор ответов" : "Результат попытки"}</h2>
      {result !== null && (
        <p>
          <strong>
            Статус: {describeResultStatus(result.status)}. Баллы:{" "}
            {formatScore(result.score, result.maxScore)}
          </strong>
        </p>
      )}
      <p>
        Заполнено: {progress.answered} из {progress.total}
      </p>
      <ol>
        {set.tasks.map((task) => {
          const item = result === null ? undefined : findResultItem(result, task.id);
          return (
            <li key={task.id}>
              <strong>
                {task.id}: {task.prompt}
              </strong>
              <p className="answer-text">
                {describeAnswer(task, findAnswer(answers, task.id))}
              </p>
              {item !== undefined && (
                <p className="result-item">
                  Проверка: {describeItemStatus(item.status)}. Баллы:{" "}
                  {formatScore(item.score, item.maxScore)}
                  {item.feedback !== "" ? `. ${item.feedback}` : ""}
                </p>
              )}
              {editable && canClear(task.id) && (
                <button
                  type="button"
                  className="clear"
                  disabled={busy}
                  onClick={() => onClear(task.id)}
                >
                  Очистить ответ
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
