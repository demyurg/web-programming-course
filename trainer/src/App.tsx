import { useState } from "react";
import {
  countProgress,
  findAnswer,
  findTask,
  isAnswerFilled,
  type Answer,
} from "./domain";
import { trainingSet } from "./set";
import { TaskCard } from "./components/TaskCard";

type AttemptStatus = "in-progress" | "submitted";

export default function App() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<AttemptStatus>("in-progress");

  const tasks = trainingSet.tasks;
  const totalTasks = tasks.length;

  const currentTask = tasks[currentIndex];
  const currentAnswer = currentTask ? findAnswer(answers, currentTask.id) : undefined;

  const progress = countProgress(trainingSet, answers);

  const handleAnswerChange = (newAnswer: Answer) => {
    if (status === "submitted") {
      return;
    }
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.taskId === newAnswer.taskId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalTasks - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const getUnfilledTasks = () => {
    const unfilled: string[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const answer = findAnswer(answers, task.id);
      if (answer === undefined || !isAnswerFilled(answer)) {
        unfilled.push(`${i + 1}. ${task.prompt}`);
      }
    }
    return unfilled;
  };

  const handleFinish = () => {
    if (status === "submitted") {
      return;
    }
    const unfilled = getUnfilledTasks();
    if (unfilled.length > 0) {
      const message =
        "Есть незаполненные задания:\n" +
        unfilled.map((u) => "- " + u).join("\n") +
        "\n\nЗавершить попытку?";
      const confirmed = window.confirm(message);
      if (!confirmed) {
        return;
      }
    }
    setStatus("submitted");
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("in-progress");
  };

  if (totalTasks === 0) {
    return (
      <main>
        <header>
          <h1>{trainingSet.title}</h1>
          <p>Заданий в наборе: 0</p>
        </header>
        <p>В наборе нет заданий.</p>
      </main>
    );
  }

  if (status === "submitted") {
    return (
      <main>
        <header>
          <h1>{trainingSet.title}</h1>
          <p>Попытка завершена</p>
          <p>
            Прогресс: {progress.filled} / {progress.total}
          </p>
        </header>
        <section>
          <h2>Обзор ответов</h2>
          {tasks.map((task, index) => {
            const answer = findAnswer(answers, task.id);
            const filled = answer !== undefined && isAnswerFilled(answer);
            return (
              <article key={task.id} className="task-card">
                <p>
                  Задание {index + 1}. Тема: {task.topic}
                </p>
                <h3>{task.prompt}</h3>
                {task.code !== undefined && <pre>{task.code}</pre>}
                {task.kind === "single-choice" ? (
                  <div>
                    <p>Варианты:</p>
                    <ul>
                      {task.options.map((option) => {
                        const isSelected =
                          answer && answer.kind === "single-choice"
                            ? answer.optionId === option.id
                            : false;
                        return (
                          <li key={option.id}>
                            {isSelected ? <strong>{option.label} (выбрано)</strong> : option.label}
                          </li>
                        );
                      })}
                    </ul>
                    {!filled && <p>Ответ не выбран.</p>}
                  </div>
                ) : (
                  <div>
                    <p>Ответ:</p>
                    {filled && answer && answer.kind === "short-text" ? (
                      <pre>{answer.text}</pre>
                    ) : (
                      <p>Ответ не заполнен.</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
        <div style={{ marginTop: "1rem" }}>
          <button type="button" onClick={handleRestart}>
            Начать новую попытку
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>{trainingSet.title}</h1>
        <p>
          Задание {currentIndex + 1} / {totalTasks}
        </p>
        <p>
          Прогресс: {progress.filled} / {progress.total}
        </p>
      </header>
      {currentTask ? (
        <TaskCard
          task={currentTask}
          answer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          readOnly={false}
        />
      ) : (
        <p>Задание не найдено.</p>
      )}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button type="button" onClick={goToPrevious} disabled={currentIndex === 0}>
          Назад
        </button>
        {currentIndex < totalTasks - 1 ? (
          <button type="button" onClick={goToNext}>
            Дальше
          </button>
        ) : (
          <button type="button" onClick={handleFinish}>
            Завершить попытку
          </button>
        )}
        <button type="button" onClick={handleFinish}>
          Завершить попытку
        </button>
      </div>
    </main>
  );
}
