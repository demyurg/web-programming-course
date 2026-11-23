
import type { Task, Answer } from "./domain";

type AttemptReviewProps = {
  tasks: Task[];
  answers: Answer[];
  submitted: boolean;
  onClearAnswer: (taskId: string) => void;
};

export default function AttemptReview({tasks, answers, submitted, onClearAnswer}: AttemptReviewProps) {

  function getAnswerText(task: Task): string {
    const answer = answers.find((item) => item.taskId === task.id);

    if (!answer) {
      return "Нет ответа";
    }

    if (answer.kind === "single-choice" && task.kind === "single-choice") {
      const selectedOption = task.options.find(
        (option) => option.id === answer.optionId
      );

      if (selectedOption) {
        return selectedOption.label;
      }
    }

    if (answer.kind === "short-text" && task.kind === "short-text") {
      if (answer.text.trim() !== "") {
        return answer.text;
      }
    }

    return "Нет ответа";
  }

  return (
    <section className="answers-review">
      <h3>Обзор ответов</h3>

      {tasks.map((task) => (
        <div key={task.id}>
          <h4>{task.topic}</h4>
          <p>{task.prompt}</p>
          <p>Ваш ответ: {getAnswerText(task)}</p>

          {!submitted && answers.some(
            (answer) => answer.taskId === task.id) && (
            <button onClick={() => onClearAnswer(task.id)}>Очистить ответ</button>
          )}
        </div>
      ))}
    </section>
  );
}
