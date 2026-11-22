import type { ApiAnswer, ApiTask } from "../api/trainerApi";

type AttemptReviewProps = {
  tasks: ApiTask[];
  answers: ApiAnswer[];
  canClear: boolean;                                 //можно ли очищать ответы (до submit)
  onClearAnswer: (taskId: string) => void;           //вызывается при нажатии «Очистить ответ»
  busy?: boolean;                                    //true, пока идёт запрос — блокируем кнопки
};

function findAnswer(answers: ApiAnswer[], taskId: string): ApiAnswer | undefined {
  return answers.find((answer) => answer.taskId === taskId);
}

function renderAnswerText(task: ApiTask, answer: ApiAnswer | undefined): string {
  if (!answer) return "Нет ответа";

  if (task.kind === "single-choice" && answer.kind === "single-choice") {
    const option = task.options.find((option) => option.id === answer.optionId);
    return option?.label ?? "Нет ответа";
  }

  if (task.kind === "short-text" && answer.kind === "short-text") {
    return answer.text.trim().length > 0 ? answer.text : "Нет ответа";
  }

  return "Нет ответа";
}

export default function AttemptReview({
  tasks,
  answers,
  canClear,
  onClearAnswer,
  busy = false,
}: AttemptReviewProps) {
  return (
    <section className="answers-review">
      <h2>Обзор ответов</h2>

      {tasks.map((task) => {
        const answer = findAnswer(answers, task.id);

        return (
          <div key={task.id}>
            <h3>{task.prompt}</h3>
            <p>Ответ: {renderAnswerText(task, answer)}</p>

            {canClear && answer && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onClearAnswer(task.id)}
              >
                Очистить ответ
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}