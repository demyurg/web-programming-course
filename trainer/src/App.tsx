import { useReducer, useState } from "react";
import type { Answer, Task, TrainingSet } from "./domain";
import { countProgress, findTaskById, isAnswerFilled } from "./domain";
import {
  attemptReducer,
  createAttempt,
  findAnswer,
  getUnfilledTasks,
  isTaskAnswered,
} from "./attempt";

const webBasics: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [
    {
      id: "ts-1",
      kind: "single-choice",
      topic: "typescript",
      prompt: "Что выведет этот JavaScript-код?",
      code: 'console.log("10" * 5);',
      options: [
        { id: "a", label: "105" },
        { id: "b", label: "50" },
        { id: "c", label: "Ошибка" },
      ],
    },
    {
      id: "ts-2",
      kind: "single-choice",
      topic: "typescript",
      prompt: "Что возвращает find, если элемент не найден?",
      options: [
        { id: "a", label: "undefined" },
        { id: "b", label: "Пустой массив" },
        { id: "c", label: "false" },
      ],
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "react",
      prompt: "Объясните, чем props компонента отличаются от его состояния.",
    },
    {
      id: "http-1",
      kind: "short-text",
      topic: "http",
      prompt: "Что нужно проверить в ответе fetch перед использованием JSON?",
    },
  ],
};

const initialAttempt = createAttempt();

function describeAnswer(task: Task, answer: Answer | undefined): string {
  if (answer === undefined || !isAnswerFilled(answer)) {
    return "не заполнено";
  }
  if (answer.kind === "single-choice") {
    const optionId = answer.optionId;
    const option =
      task.kind === "single-choice"
        ? task.options.find((item) => item.id === optionId)
        : undefined;
    return option ? `${option.id}) ${option.label}` : optionId;
  }
  return answer.text;
}

type TaskListProps = {
  tasks: Task[];
  answers: Answer[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function TaskList({ tasks, answers, selectedId, onSelect }: TaskListProps) {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            aria-pressed={task.id === selectedId}
            onClick={() => onSelect(task.id)}
          >
            {isTaskAnswered(answers, task.id) ? "✓ " : ""}
            {task.id}: {task.prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  onClear: () => void;
};

function TaskCard({ task, answer, onAnswer, onClear }: TaskCardProps) {
  const selectedOptionId =
    answer?.kind === "single-choice" ? answer.optionId : undefined;
  const text = answer?.kind === "short-text" ? answer.text : "";
  const canClear = answer !== undefined && isAnswerFilled(answer);

  return (
    <article className="task-card">
      <p className="topic">Тема: {task.topic}</p>
      <h2>{task.prompt}</h2>
      {task.code !== undefined && <pre>{task.code}</pre>}
      {task.kind === "single-choice" ? (
        <fieldset>
          <legend>Выберите вариант</legend>
          {task.options.map((option) => (
            <div key={option.id}>
              <label>
                <input
                  type="radio"
                  name={`task-${task.id}`}
                  checked={selectedOptionId === option.id}
                  onChange={() =>
                    onAnswer({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option.id,
                    })
                  }
                />{" "}
                {option.id}) {option.label}
              </label>
            </div>
          ))}
        </fieldset>
      ) : (
        <label>
          Ваш ответ
          <textarea
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
        </label>
      )}
      <button type="button" className="clear" disabled={!canClear} onClick={onClear}>
        Очистить ответ
      </button>
    </article>
  );
}

type OverviewProps = {
  set: TrainingSet;
  answers: Answer[];
  editable: boolean;
  onClear: (taskId: string) => void;
};

function Overview({ set, answers, editable, onClear }: OverviewProps) {
  const progress = countProgress(set, answers);

  return (
    <section className="overview">
      <h2>Обзор ответов</h2>
      <p>
        Заполнено: {progress.answered} из {progress.total}
      </p>
      <ol>
        {set.tasks.map((task) => (
          <li key={task.id}>
            <strong>
              {task.id}: {task.prompt}
            </strong>
            <p className="answer-text">
              {describeAnswer(task, findAnswer(answers, task.id))}
            </p>
            {editable && isTaskAnswered(answers, task.id) && (
              <button type="button" className="clear" onClick={() => onClear(task.id)}>
                Очистить ответ
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

type View = "task" | "overview";

export default function App() {
  const tasks = webBasics.tasks;
  const firstId = tasks[0]?.id ?? "";

  const [attempt, dispatch] = useReducer(attemptReducer, initialAttempt);
  const [selectedId, setSelectedId] = useState<string>(firstId);
  const [view, setView] = useState<View>("task");

  const { answers, status } = attempt;

  const selected = findTaskById(webBasics, selectedId);
  const index = tasks.findIndex((task) => task.id === selectedId);
  const prevTask = index > 0 ? tasks[index - 1] : undefined;
  const nextTask = index >= 0 ? tasks[index + 1] : undefined;
  const progress = countProgress(webBasics, answers);
  const unfilled = getUnfilledTasks(webBasics, answers);

  function handleAnswer(answer: Answer) {
    dispatch({ type: "set-answer", answer });
  }

  function handleClear(taskId: string) {
    dispatch({ type: "clear-answer", taskId });
  }

  function handleFinish() {
    if (unfilled.length > 0) {
      const ids = unfilled.map((task) => task.id).join(", ");
      const confirmed = window.confirm(
        `Не заполнены задания: ${ids}. Всё равно завершить попытку?`,
      );
      if (!confirmed) return;
    }
    dispatch({ type: "submit" });
  }

  function handleRestart() {
    dispatch({ type: "restart" });
    setSelectedId(firstId);
    setView("task");
  }

  return (
    <main>
      <h1>
        {webBasics.title} (заданий: {tasks.length})
      </h1>
      {tasks.length === 0 ? (
        <p>В модуле пока нет заданий.</p>
      ) : status === "submitted" ? (
        <>
          <Overview
            set={webBasics}
            answers={answers}
            editable={false}
            onClear={handleClear}
          />
          <button type="button" className="finish" onClick={handleRestart}>
            Начать новую попытку
          </button>
        </>
      ) : (
        <>
          <p>
            Прогресс: {progress.answered} из {progress.total}
          </p>
          <p>
            {unfilled.length === 0
              ? "Все задания заполнены."
              : `Не заполнены: ${unfilled.map((task) => task.id).join(", ")}`}
          </p>
          <button
            type="button"
            className="view-toggle"
            onClick={() => setView(view === "task" ? "overview" : "task")}
          >
            {view === "task" ? "Обзор ответов" : "Вернуться к заданиям"}
          </button>
          {view === "overview" ? (
            <Overview
              set={webBasics}
              answers={answers}
              editable={true}
              onClear={handleClear}
            />
          ) : (
            <div className="layout">
              <TaskList
                tasks={tasks}
                answers={answers}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <div className="task-column">
                {selected ? (
                  <TaskCard
                    task={selected}
                    answer={findAnswer(answers, selected.id)}
                    onAnswer={handleAnswer}
                    onClear={() => handleClear(selected.id)}
                  />
                ) : (
                  <p>Задание не выбрано.</p>
                )}
                <div className="nav">
                  <button
                    type="button"
                    disabled={prevTask === undefined}
                    onClick={() => prevTask && setSelectedId(prevTask.id)}
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    disabled={nextTask === undefined}
                    onClick={() => nextTask && setSelectedId(nextTask.id)}
                  >
                    Далее
                  </button>
                </div>
              </div>
            </div>
          )}
          <button type="button" className="finish" onClick={handleFinish}>
            Завершить попытку
          </button>
        </>
      )}
    </main>
  );
}