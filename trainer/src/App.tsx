import { useState } from "react";
import { trainingSet } from "./taskCatalog";
import TaskNavigation from "./TaskNavigation";
import TaskDetails from "./TaskDetails";
import { findTask, getProgress } from "./domain";
import type { Answer } from "./domain";

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    trainingSet.tasks[0]?.id ?? null
  );
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

function handleAnswerChange(newAnswer: Answer) {
  const existingAnswer = answers.find(
    (answer) => answer.taskId === newAnswer.taskId
  );

  if (existingAnswer) {
    setAnswers(
      answers.map((answer) => {
        if (answer.taskId === newAnswer.taskId) {
          return newAnswer;
        }

        return answer;
      })
    );
  } else {
    setAnswers([...answers, newAnswer]);
  }
}
function handlePreviousTask() {
  const currentIndex = trainingSet.tasks.findIndex(
    (task) => task.id === selectedTaskId
  );

  if (currentIndex > 0) {
    setSelectedTaskId(trainingSet.tasks[currentIndex - 1].id);
  }
}

function handleNextTask() {
  const currentIndex = trainingSet.tasks.findIndex(
    (task) => task.id === selectedTaskId
  );

  if (currentIndex < trainingSet.tasks.length - 1) {
    setSelectedTaskId(trainingSet.tasks[currentIndex + 1].id);
  }
}

function handleFinish() {
  if (unansweredTasks.length > 0) {
    const confirmed = window.confirm(
      "Осталось незаполненных заданий: ${unansweredTasks.length}. Завершить попытку?"
    );

    if (!confirmed) {
      return;
    }
  }

  setIsSubmitted(true);
}

  if (trainingSet.tasks.length === 0) {
    return (
      <div>
        <h1>{trainingSet.title}</h1>
        <p>В модуле пока нет заданий.</p>
      </div>
    );
  }

  const selectedTask = selectedTaskId !== null ? findTask(trainingSet.tasks, selectedTaskId) : undefined;
  const progress = getProgress(trainingSet.tasks, answers);

const unansweredTasks = trainingSet.tasks.filter((task) => {
  const answer = answers.find(
    (item) => item.taskId === task.id
  );

  if (!answer) {
    return true;
  }

  if (task.kind === "single-choice") {
    return answer.kind !== "single-choice";
  }

  if (answer.kind !== "short-text") {
    return true;
  }

  return answer.text.trim() === "";
});

  let taskContent;

  if (selectedTask) {
    taskContent = (<TaskDetails
      task={selectedTask}
      answers={answers}
      onAnswerChange={handleAnswerChange}
    />
  );
  } else {
    taskContent = <p>Задание не найдено.</p>;
  }

  return (
    <div>
      <h1>{trainingSet.title}</h1>
      <p>Количество заданий: {trainingSet.tasks.length}</p>

      {!isSubmitted && (
        <>
          <p>Прогресс: {progress.filled} из {progress.total}</p>

          {unansweredTasks.length > 0 && (
            <div>
              <h3>Незаполненные задания</h3>
              <ul>
                {unansweredTasks.map((task) => (
                  <li key={task.id}>
                    <button onClick={() => setSelectedTaskId(task.id)}>
                      {task.topic}: {task.prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
     
      {!isSubmitted ? (
        <>
          <TaskNavigation
            tasks={trainingSet.tasks}
            onTaskSelect={setSelectedTaskId}
          />

          {taskContent}

          <div className="navigation-buttons">
            <button
              onClick={handlePreviousTask}
              disabled={selectedTaskId === trainingSet.tasks[0].id}
            >
              Назад
            </button>

            <button
              onClick={handleNextTask}
              disabled={
                selectedTaskId ===
                trainingSet.tasks[trainingSet.tasks.length - 1].id
              }
            >
              Далее
            </button>
          </div>

          <button className="finish-button" onClick={handleFinish}>
            Завершить попытку
          </button>
        </>
      ) : (
        <div>
          <h2>Попытка завершена</h2>

          <h3>Обзор ответов</h3>

          {trainingSet.tasks.map((task) => {
            const answer = answers.find(
              (item) => item.taskId === task.id
            );

            let answerText = "Нет ответа";

            if (answer) {
              if (answer.kind === "single-choice" &&
                  task.kind === "single-choice") {
                const selectedOption = task.options.find(
                  (option) => option.id === answer.optionId
                );

                if (selectedOption) {
                  answerText = selectedOption.label;
                }
              } else if (answer.kind === "short-text") {
                if (answer.text.trim() !== "") {
                  answerText = answer.text;
                }
              }
            }

            return (
              <div key={task.id}>
                <h4>{task.topic}</h4>
                <p>{task.prompt}</p>
                <p>Ваш ответ: {answerText}</p>
              </div>
            );
          })}

          <button
            onClick={() => {
              setAnswers([]);
              setSelectedTaskId(trainingSet.tasks[0].id);
              setIsSubmitted(false);
            }}
          >
            Начать новую попытку
          </button>
        </div>
      )}

    </div>
  );
}
