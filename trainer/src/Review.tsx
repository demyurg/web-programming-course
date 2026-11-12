import type { Answer, Progress, Task } from "./domain";
import { isAnswerFilled } from "./domain";

type ReviewProps = {
  tasks: Task[];
  answers: Record<string, Answer>;
  progress: Progress;
  submitted: boolean;
  onClear: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onRestart: () => void;
};

function describeAnswer(task: Task, answer: Answer | undefined): string {
  if (answer === undefined || !isAnswerFilled(answer)) {
    return "Пропущено";
  }
  if (task.kind === "single-choice" && answer.kind === "single-choice") {
    const option = task.options.find((item) => item.id === answer.optionId);
    return option === undefined ? answer.optionId : `${option.id}) ${option.label}`;
  }
  if (answer.kind === "short-text") {
    return answer.text;
  }
  return "Пропущено";
}

export function Review({
  tasks,
  answers,
  progress,
  submitted,
  onClear,
  onOpenTask,
  onRestart,
}: ReviewProps) {
  return (
    <section className="review">
      <h2>{submitted ? "Попытка завершена" : "Обзор ответов"}</h2>
      <p>
        Заполнено: {progress.answered} из {progress.total}
      </p>
      <ol>
        {tasks.map((task) => (
          <li key={task.id}>
            <p>
              <strong>{task.id}:</strong> {task.prompt}
            </p>
            <p className="review-answer">{describeAnswer(task, answers[task.id])}</p>
            {!submitted && (
              <div className="review-actions">
                <button type="button" onClick={() => onOpenTask(task.id)}>
                  Изменить
                </button>
                <button
                  type="button"
                  disabled={answers[task.id] === undefined}
                  onClick={() => onClear(task.id)}
                >
                  Очистить
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {submitted && (
        <button type="button" className="finish" onClick={onRestart}>
          Начать новую попытку
        </button>
      )}
    </section>
  );
}