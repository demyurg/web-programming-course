import { useState } from "react";
import { trainingSet } from "./taskCatalog";
import TaskNavigation from "./TaskNavigation";
import TaskDetails from "./TaskDetails";
import { findTask, getProgress, updateAnswer, finishAttempt, clearAnswer } from "./domain";
import type { Answer, Attempt, Task } from "./domain";

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    trainingSet.tasks[0]?.id ?? null);

  const [attempt, setAttempt] = useState<Attempt>({answers: [],submitted: false,});

function handleAnswerChange(newAnswer: Answer) {
  setAttempt(updateAnswer(attempt, newAnswer));
}

function handleClearAnswer(taskId: string) {
  setAttempt(clearAnswer(attempt, taskId));
}

function handleNewAttempt() {
  setAttempt({answers: [],submitted: false,});

  setSelectedTaskId(trainingSet.tasks[0].id);
}

function handlePreviousTask() {
  const currentIndex = trainingSet.tasks.findIndex(
    (task) => task.id === selectedTaskId);

  if (currentIndex > 0) {
    setSelectedTaskId(trainingSet.tasks[currentIndex - 1].id);
  }
}

function handleNextTask() {
  const currentIndex = trainingSet.tasks.findIndex((task) => task.id === selectedTaskId);

  if (currentIndex < trainingSet.tasks.length - 1) {
    setSelectedTaskId(trainingSet.tasks[currentIndex + 1].id);
  }
}

function handleFinish() {
  if (unansweredTasks.length > 0) {
    const confirmed = window.confirm(
      `Осталось незаполненных заданий: ${unansweredTasks.length}. Завершить попытку?`);

    if (!confirmed) {
      return;
    }
  }

  setAttempt(finishAttempt(attempt));
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
const progress = getProgress(trainingSet.tasks, attempt.answers);

const unansweredTasks = trainingSet.tasks.filter((task) => {
  const answer = attempt.answers.find((item) => item.taskId === task.id);

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
      answers={attempt.answers}
      onAnswerChange={handleAnswerChange}
      onClearAnswer={handleClearAnswer}
    />
  );
  } else {
    taskContent = <p>Задание не найдено.</p>;
  }

function getAnswerText(task: Task): string {
  const answer = attempt.answers.find((item) => item.taskId === task.id);

  if (!answer) {
    return "Нет ответа";
  }

  if (answer.kind === "single-choice" && task.kind === "single-choice") {
    const selectedOption = task.options.find((option) => option.id === answer.optionId);

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
    <div>
      <h1>{trainingSet.title}</h1>
      <p>Количество заданий: {trainingSet.tasks.length}</p>

      {!attempt.submitted && (
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

      {!attempt.submitted && (
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
              disabled={selectedTaskId === trainingSet.tasks[trainingSet.tasks.length - 1].id}
            >
              Далее
            </button>
          </div>

                    <button className="finish-button" onClick={handleFinish}>
            Завершить попытку
          </button>
        </>
      )}

      {attempt.submitted && (
        <>
          <h2>Попытка завершена</h2>

          <button onClick={handleNewAttempt}>
            Начать новую попытку
          </button>
        </>
      )}

      <div>
        <h3>Обзор ответов</h3>

        {trainingSet.tasks.map((task) => (
          <div key={task.id}>
            <h4>{task.topic}</h4>
            <p>{task.prompt}</p>
            <p>Ваш ответ: {getAnswerText(task)}</p>

            {!attempt.submitted && attempt.answers.some((answer) => answer.taskId === task.id) && (
                <button onClick={() => handleClearAnswer(task.id)}>
                  Очистить ответ
                </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
