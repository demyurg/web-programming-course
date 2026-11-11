import { useState } from "react";
import type { Answer, TrainingSet } from "../domain";
import { isAnswer} from "../domain";
import { AnswerField } from "./AnswerField";

type Props = { trainingSet: TrainingSet }; 

export function AttemptScreen({ trainingSet }: Props) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"in-progress" | "submitted">("in-progress");

  const answeredCount = trainingSet.tasks.filter((task) => {
    const ans = answers.find((a) => a.taskId === task.id);
    return ans !== undefined && isAnswer(ans);
  }).length;

  const unansweredTasks = trainingSet.tasks.filter((task) => {
    const ans = answers.find((a) => a.taskId === task.id);
    return ans === undefined || !isAnswer(ans);
  });

  const currentTask = trainingSet.tasks[currentIndex];
  const currentAnswer = answers.find((a) => a.taskId === currentTask.id);

  function replaceAnswer(next: Answer) {
    setAnswers((current) => [
      ...current.filter((item) => item.taskId !== next.taskId),
      next,
    ]);
  }

  const goNext = () =>
    setCurrentIndex((i) => Math.min(i + 1, trainingSet.tasks.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  function handleFinish() {
    if (unansweredTasks.length > 0) {
      const ids = unansweredTasks.map((t) => t.id).join(", ");
      const ok = window.confirm(`Не отвечено на задания: ${ids}. Завершить?`);
      if (!ok) return;
    }
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <div>
        <h2>Обзор попытки</h2>
        <ul>
          {trainingSet.tasks.map((task) => {
            const ans = answers.find((a) => a.taskId === task.id);
            return (
              <li key={task.id}>
                <strong>{task.id}</strong>:{" "}
                {!isAnswer(ans)
                  ? "— нет ответа"
                  : ans!.kind === "single-choice"
                    ? `выбран ${ans!.optionId}`
                    : (ans as { text: string }).text}
              </li>
            );
          })}
        </ul>
        <button
          onClick={() => {
            setAnswers([]);
            setCurrentIndex(0);
            setStatus("in-progress");
          }}
        >
          Начать новую попытку
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>
        Задание {currentIndex + 1} из {trainingSet.tasks.length}. Прогресс:{" "}
        {answeredCount} из {trainingSet.tasks.length}
      </p>

      <AnswerField
        task={currentTask}
        answer={currentAnswer}
        onChange={replaceAnswer}
      />

      <div>
        <button onClick={goPrev} disabled={currentIndex === 0}>
          Назад
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === trainingSet.tasks.length - 1}
        >
          Далее
        </button>
        <button onClick={handleFinish}>Завершить</button>
      </div>
    </div>
  );
}