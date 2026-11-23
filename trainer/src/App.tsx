import { useEffect, useState } from "react";
import { getSets, getSet } from "./api/trainerApi";
import type { TrainingSet } from "./domain";
import TaskNavigation from "./TaskNavigation";
import TaskDetails from "./TaskDetails";
import { findTask, getProgress } from "./domain";
import { useAttempt } from "./useAttempt";
import AttemptReview from "./AttemptReview";

export default function App() {
  const [activeSection, setActiveSection] = useState("tasks");
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {attempt, saveError, pendingAnswer, handleRetrySave, handleCreateAttempt, handleRestoreAttempt, handleAnswerChange, handleClearAnswer, handleFinish: finishAttempt, handleNewAttempt, result} = useAttempt();

  useEffect(() => {
    async function loadTrainingSet() {
      try {
        setIsLoading(true);
        setError(null);

        const sets = await getSets();

        if (sets.length === 0) {
          throw new Error("Нет доступных наборов заданий");
        }

        const data = await getSet(sets[0].id);

        setTrainingSet(data);

        const savedAttemptId = localStorage.getItem("attemptId");

        if (savedAttemptId) {
          await handleRestoreAttempt(savedAttemptId);
        } else {
          await handleCreateAttempt(data.id);
        }

        setSelectedTaskId(data.tasks[0]?.id ?? null);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Произошла неизвестная ошибка");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTrainingSet();
  }, []);

  if (isLoading) {
    return <p>Загрузка заданий...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  if (!trainingSet) {
    return <p>Набор заданий не найден.</p>;
  }

  function handlePreviousTask() {
    if (!trainingSet) {
      return;
    }

    const currentIndex = trainingSet.tasks.findIndex(
      (task) => task.id === selectedTaskId
    );

    if (currentIndex > 0) {
      setSelectedTaskId(trainingSet.tasks[currentIndex - 1].id);
    }
  }

  function handleNextTask() {
    if (!trainingSet) {
      return;
    }

    const currentIndex = trainingSet.tasks.findIndex(
      (task) => task.id === selectedTaskId
    );

    if (currentIndex < trainingSet.tasks.length - 1) {
      setSelectedTaskId(trainingSet.tasks[currentIndex + 1].id);
    }
  }

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

    return answer.text === "";
  });

  function handleFinish() {
    if (unansweredTasks.length > 0) {
      const confirmed = window.confirm(`Осталось незаполненных заданий: ${unansweredTasks.length}. Завершить попытку?`);

      if (!confirmed) {
        return;
      }
    }
    finishAttempt();
  }

  async function handleStartNewAttempt() {
    if (!trainingSet) {
      return;
    }

    await handleNewAttempt(trainingSet.id);

    setSelectedTaskId(trainingSet.tasks[0]?.id ?? null);
    setActiveSection("tasks");
  }

  if (trainingSet.tasks.length === 0) {
    return (
      <div>
        <h1>{trainingSet.title}</h1>
        <p>В модуле пока нет заданий.</p>
      </div>
    );
  }

  const selectedTask = selectedTaskId !== null? findTask(trainingSet.tasks, selectedTaskId): undefined;
  const progress = getProgress(trainingSet.tasks, attempt.answers);

  let taskContent;

  if (selectedTask) {
    taskContent = (
      <TaskDetails
        task={selectedTask}
        answers={attempt.answers}
        onAnswerChange={handleAnswerChange}
        onClearAnswer={handleClearAnswer}
      />
    );
  } else {
    taskContent = <p>Задание не найдено.</p>;
  }

  function getResultStatus(status: string): string {
    if (status === "correct") {
      return "Правильно";
    }

    if (status === "incorrect") {
      return "Неправильно";
    }

    if (status === "unanswered") {
      return "Нет ответа";
    }

    if (status === "pending-review") {
      return "Ожидает проверки";
    }

    return "Неизвестный статус";
  }

  return (
    <div>
      <h1>{trainingSet.title}</h1>

      {saveError && <p>Ошибка сохранения: {saveError}</p>}

      {pendingAnswer && (
        <button onClick={handleRetrySave}> Повторить сохранение</button>)}

      <p>Количество заданий: {trainingSet.tasks.length}</p>

      {!attempt.submitted && (
        <>
          <p> Прогресс: {progress.filled} из {progress.total} </p>

          <div className="section-buttons">
            <button className={activeSection === "tasks" ? "active" : ""} onClick={() => setActiveSection("tasks")}>
              Все задания
            </button>

            <button
              className={activeSection === "unanswered" ? "active" : ""} onClick={() => setActiveSection("unanswered")}>
              Незаполненные ({unansweredTasks.length})
            </button>

            <button
              className={activeSection === "answers" ? "active" : ""} onClick={() => setActiveSection("answers")}>
              Обзор ответов
            </button>
          </div>

          {activeSection === "tasks" && (
            <>
              <TaskNavigation
                tasks={trainingSet.tasks}
                onTaskSelect={setSelectedTaskId}
              />

              {taskContent}

              <div className="navigation-buttons">
                <button onClick={handlePreviousTask} disabled={selectedTaskId === trainingSet.tasks[0].id}>
                  Назад
                </button>

                <button onClick={handleNextTask} disabled={selectedTaskId === trainingSet.tasks[trainingSet.tasks.length - 1].id}>
                  Далее
                </button>
              </div>

              <button className="finish-button" onClick={handleFinish}>
                Завершить попытку
              </button>
            </>
          )}

          {activeSection === "unanswered" && (
            <div className="section-content">
              <h2>Незаполненные задания</h2>

              {unansweredTasks.length > 0 ? (
                <ul>
                  {unansweredTasks.map((task) => (
                    <li key={task.id}>
                      <button onClick={() => {setSelectedTaskId(task.id);setActiveSection("tasks");}}>
                        {task.topic}: {task.prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Все задания заполнены!</p>
              )}
            </div>
          )}

          {activeSection === "answers" && (
            <div className="section-content">

              <AttemptReview
                tasks={trainingSet.tasks}
                answers={attempt.answers}
                submitted={attempt.submitted}
                onClearAnswer={handleClearAnswer}
              />
            </div>
          )}
        </>
      )}

      {attempt.submitted && (
        <>
          <h2>Попытка завершена</h2>
          {result && (
            <>
              {result.score !== null ? (
                <p>Ваш результат: {result.score} из {result.maxScore} баллов</p>) : (<p>Результат ожидает проверки.</p>
              )}

              <h3>Результаты по заданиям</h3>

              {result.items.map((item) => {
                const task = findTask(trainingSet.tasks, item.taskId);

                return (
                  <div key={item.taskId}>
                    <p>{task ? task.prompt : `Задание ${item.taskId}`}</p>
                    <p>Статус: {getResultStatus(item.status)}</p>

                    <p>{item.feedback}</p>
                  </div>
                );
              })}
            </>
          )}

          <button onClick={handleStartNewAttempt}> Начать новую попытку</button>
        </>
      )}
    </div>
  );
}
