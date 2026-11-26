import type { Answer, Task } from "./domain";

type TaskDetailsProps = {
  task: Task;
  answers: Answer[];
  onAnswerChange: (answer: Answer) => void;
};

export default function TaskDetails({ task, answers, onAnswerChange, }: TaskDetailsProps) {
   
  let answerContent;

  const currentAnswer = answers.find(
    (answer) => answer.taskId === task.id
  );

  if (task.kind === "single-choice") {
    answerContent = (
      <fieldset>
        <legend>Выберите один вариант ответа</legend>

        {task.options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name={task.id}
              value={option.id}
              checked={
                currentAnswer?.kind === "single-choice" &&
                currentAnswer.optionId === option.id
              }
              onChange={() => {
                onAnswerChange({
                  taskId: task.id,
                  kind: "single-choice",
                  optionId: option.id,
                });
              }}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  } else {
    let text = "";

    if (currentAnswer?.kind === "short-text") {
      text = currentAnswer.text;
    }

    answerContent = (
      <label>
        Ваш ответ:
        <textarea
          value={text}
          onChange={(event) => {
            onAnswerChange({
              taskId: task.id,
              kind: "short-text",
              text: event.target.value,
            });
          }}
        />
      </label>
    );
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
