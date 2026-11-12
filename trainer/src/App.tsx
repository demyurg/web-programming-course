import { useReducer, useState } from "react";
import type { Answer, Task } from "./domain";
import {
  attemptReducer,
  emptyAttempt,
  findAnswer,
  getUnansweredTasks,
  isAnswerFilled,
} from "./attempt";
import { mainSet } from "./training-data";
import "./App.css";

type TaskListProps = {
  tasks: Task[];
  selectedTaskId: string;
  onChoose: (id: string) => void;
};

function TaskList({ tasks, selectedTaskId, onChoose }: TaskListProps) {
  return (
    <nav className="task-list" aria-label="Список заданий">
      {tasks.map((task, index) => (
        <button
          key={task.id}
          type="button"
          className={
            task.id === selectedTaskId
              ? "task-button selected"
              : "task-button"
          }
          onClick={() => onChoose(task.id)}
        >
          <span className="task-number">{index + 1}</span>
          <span>{task.topic}</span>
        </button>
      ))}
    </nav>
  );
}

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  onClear: (taskId: string) => void;
};

function TaskCard({ task, answer, onAnswer, onClear }: TaskCardProps) {
  const selectedOptionId =
    answer?.kind === "single-choice" ? answer.optionId : "";
  const text = answer?.kind === "short-text" ? answer.text : "";

  return (
    <article className="task-card">
      <div className="task-meta">
        <span className="topic">{task.topic}</span>
        <span className="task-kind">
          {task.kind === "single-choice"
            ? "Выбор ответа"
            : "Текстовое задание"}
        </span>
      </div>

      <h2>Условие задания</h2>
      <p>{task.prompt}</p>

      {task.code && (
        <pre className="code-block">
          <code>{task.code}</code>
        </pre>
      )}

      {task.kind === "single-choice" ? (
        <fieldset className="options">
          <legend>Варианты ответа</legend>
          {task.options.map((option) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={task.id}
                checked={selectedOptionId === option.id}
                onChange={() =>
                  onAnswer({
                    taskId: task.id,
                    kind: "single-choice",
                    optionId: option.id,
                  })
                }
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="text-answer">
          <label htmlFor={"answer-" + task.id}>Ваш ответ</label>
          <textarea
            id={"answer-" + task.id}
            rows={5}
            value={text}
            onChange={(event) =>
              onAnswer({
                taskId: task.id,
                kind: "short-text",
                text: event.target.value,
              })
            }
          />
        </div>
      )}

      <button
        type="button"
        className="action-button clear-button"
        onClick={() => onClear(task.id)}
        disabled={!isAnswerFilled(answer)}
      >
        Очистить ответ
      </button>
    </article>
  );
}

type ReviewProps = {
  tasks: Task[];
  answers: Answer[];
  editable: boolean;
  onClear: (taskId: string) => void;
};

function Review({ tasks, answers, editable, onClear }: ReviewProps) {
  return (
    <section className="task-card">
      <h2>Обзор ответов</h2>
      <ol className="review-list">
        {tasks.map((task, index) => {
          const answer = findAnswer(answers, task.id);
          let shown = "Нет ответа";

          if (answer?.kind === "single-choice" && task.kind === "single-choice") {
            const option = task.options.find((o) => o.id === answer.optionId);
            shown = option?.label ?? shown;
          }

          if (answer?.kind === "short-text" && isAnswerFilled(answer)) {
            shown = answer.text;
          }

          return (
            <li key={task.id}>
              <p className="review-prompt">{task.prompt}</p>
              <p className="review-answer">{shown}</p>
              {editable && (
                <button
                  type="button"
                  className="action-button clear-button"
                  aria-label={"Очистить ответ на задание " + (index + 1)}
                  onClick={() => onClear(task.id)}
                  disabled={!isAnswerFilled(answer)}
                >
                  Очистить ответ
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function App() {
  const tasks = mainSet.tasks;

  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? "");
  const [attempt, dispatch] = useReducer(attemptReducer, emptyAttempt);
  const [showWarning, setShowWarning] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const selectedIndex = tasks.findIndex((task) => task.id === selectedTaskId);
  const selectedTask = tasks[selectedIndex];

  const unanswered = getUnansweredTasks(tasks, attempt.answers);
  const filledCount = tasks.length - unanswered.length;
  const missingNumbers = unanswered
    .map((task) => "№" + (tasks.indexOf(task) + 1))
    .join(", ");

  function goPrev() {
    if (selectedIndex > 0) {
      setSelectedTaskId(tasks[selectedIndex - 1].id);
    }
  }

  function goNext() {
    if (selectedIndex < tasks.length - 1) {
      setSelectedTaskId(tasks[selectedIndex + 1].id);
    }
  }

  function finish() {
    if (unanswered.length > 0) {
      setShowWarning(true);
      return;
    }

    dispatch({ type: "submit" });
  }

  function startNewAttempt() {
    dispatch({ type: "restart" });
    setShowWarning(false);
    setShowReview(false);
    setSelectedTaskId(tasks[0]?.id ?? "");
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>{mainSet.title}</h1>
        <p className="subtitle">Учебный модуль - {tasks.length} заданий</p>
      </header>

      {selectedTask ? (
        <div className="workspace">
          <section className="sidebar">
            <p className="section-label">Содержание модуля</p>
            <TaskList
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onChoose={setSelectedTaskId}
            />

            <div className="progress">
              <p>
                Заполнено: {filledCount} из {tasks.length}
              </p>
              {unanswered.length > 0 ? (
                <p>
                  Не заполнены: {missingNumbers}
                </p>
              ) : (
                <p>Все задания заполнены</p>
              )}
            </div>
          </section>

          {attempt.status === "submitted" ? (
            <div>
              <Review
                tasks={tasks}
                answers={attempt.answers}
                editable={false}
                onClear={() => {}}
              />
              <div className="actions">
                <button
                  type="button"
                  className="action-button primary"
                  onClick={startNewAttempt}
                >
                  Начать новую попытку
                </button>
              </div>
            </div>
          ) : (
            <div>
              {showReview ? (
                <Review
                  tasks={tasks}
                  answers={attempt.answers}
                  editable={true}
                  onClear={(taskId) => dispatch({ type: "clear", taskId })}
                />
              ) : (
                <TaskCard
                  task={selectedTask}
                  answer={findAnswer(attempt.answers, selectedTask.id)}
                  onAnswer={(answer) => dispatch({ type: "answer", answer })}
                  onClear={(taskId) => dispatch({ type: "clear", taskId })}
                />
              )}

              <div className="actions">
                {showReview ? (
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setShowReview(false)}
                  >
                    Вернуться к заданиям
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="action-button"
                      onClick={goPrev}
                      disabled={selectedIndex === 0}
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      className="action-button"
                      onClick={goNext}
                      disabled={selectedIndex === tasks.length - 1}
                    >
                      Далее
                    </button>
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => setShowReview(true)}
                    >
                      Обзор ответов
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="action-button finish"
                  onClick={finish}
                >
                  Завершить попытку
                </button>
              </div>

              {showWarning && unanswered.length > 0 && (
                <div className="warning" role="alert">
                  <p>
                    Не заполнены задания: {missingNumbers}. Завершить попытку?
                  </p>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setShowWarning(false)}
                  >
                    Вернуться к заданиям
                  </button>
                  <button
                    type="button"
                    className="action-button finish"
                    onClick={() => dispatch({ type: "submit" })}
                  >
                    Всё равно завершить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <section className="empty-state">
          <h2>Задания отсутствуют</h2>
          <p>В этом учебном модуле пока нет заданий.</p>
        </section>
      )}
    </main>
  );
}