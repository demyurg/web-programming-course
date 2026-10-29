import type { Task } from "./domain";

type TaskDetailsProps = {
  task: Task;
};

export default function TaskDetails({ task }: TaskDetailsProps) {
  let answerContent;

  if (task.kind === "single-choice") {
    answerContent = (
      <ul>
        {task.options.map((option) => (
          <li key={option.id}>{option.label}</li>
        ))}
      </ul>
    );
  } else {
    answerContent = <p>Задание с текстовым ответом.</p>;
  }

  return (
    <div>
      <h2>{task.topic}</h2>
      <p>{task.prompt}</p>

      {task.code && <pre>{task.code}</pre>}

      {answerContent}
    </div>
  );
}
