import { useReducer } from "react";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import {
  applyAttemptAction,
  countProgress,
  createAttemptState,
  getAnswer,
  isAnswered,
  type Answer,
  type FormEvent,
  type TrainingSet,
} from "./domain";

const trainingSet: TrainingSet = {
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

function answerText(answer: Answer | undefined): string {
  if (answer === undefined || !isAnswered(answer)) {
    return "нет ответа";
  }

  if (answer.kind === "single-choice") {
    return "вариант " + answer.optionId;
  }

  return answer.text;
}

export default function App() {
  const [attempt, dispatch] = useReducer(applyAttemptAction, createAttemptState());

  const tasks = trainingSet.tasks;
  const currentTask = tasks[attempt.currentIndex];
  const progress = countProgress(trainingSet, attempt.answers);
  const skipped = tasks.filter(
    (task) => !isAnswered(getAnswer(attempt.answers, task.id))
  );
  const submitted = attempt.status === "submitted";

  function handleFormEvent(event: FormEvent) {
    if (event.type === "choose-option") {
      dispatch({
        type: "answer-changed",
        answer: {
          taskId: event.taskId,
          kind: "single-choice",
          optionId: event.optionId,
        },
      });
      return;
    }

    dispatch({
      type: "answer-changed",
      answer: {
        taskId: event.taskId,
        kind: "short-text",
        text: event.text,
      },
    });
  }

  function clearTask(taskId: string) {
    dispatch({ type: "answer-cleared", taskId });
  }

  function goTo(index: number) {
    dispatch({
      type: "moved",
      index,
      taskCount: tasks.length,
    });
  }

  function finish() {
    if (skipped.length > 0) {
      const ids = skipped.map((task) => task.id).join(", ");
      const ok = confirm("Есть незаполненные задания: " + ids + ". Завершить?");
      if (!ok) {
        return;
      }
    }

    dispatch({ type: "submitted" });
  }

  return (
    <main>
      <h1>
        {trainingSet.title} Заданий: {trainingSet.tasks.length}
      </h1>
      <p>
        Прогресс: {progress.filled} из {progress.total}
      </p>
      <p>
        Незаполненные:
        {skipped.length === 0
          ? " нет"
          : " " + skipped.map((task) => task.id).join(", ")}
      </p>
      <p>Статус попытки: {attempt.status}</p>
      <TaskList
        tasks={tasks}
        disabled={false}
        onSelect={(taskId) => {
          const index = tasks.findIndex((task) => task.id === taskId);
          if (index >= 0) {
            goTo(index);
          }
        }}
      />
      {currentTask ? (
        <TaskCard
          task={currentTask}
          answer={getAnswer(attempt.answers, currentTask.id)}
          disabled={submitted}
          onFormEvent={handleFormEvent}
        />
      ) : (
        <p>Нет выбранного задания.</p>
      )}
      <p>
        Задание {attempt.currentIndex + 1} из {tasks.length}
      </p>
      {!submitted && currentTask ? (
        <button type="button" onClick={() => clearTask(currentTask.id)}>
          Очистить ответ в карточке
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => goTo(attempt.currentIndex - 1)}
        disabled={attempt.currentIndex === 0}
      >
        Назад
      </button>
      <button
        type="button"
        onClick={() => goTo(attempt.currentIndex + 1)}
        disabled={attempt.currentIndex === tasks.length - 1}
      >
        Далее
      </button>
      {!submitted ? (
        <button type="button" onClick={finish}>
          Завершить
        </button>
      ) : null}
      <button type="button" onClick={() => dispatch({ type: "reset" })}>
        Новая попытка
      </button>
      <section>
        <h2>Обзор ответов</h2>
        <p>
          {submitted
            ? "Попытка завершена. Ответы можно только просматривать."
            : "До завершения можно смотреть и очищать ответы всей попытки."}
        </p>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.id}: {answerText(getAnswer(attempt.answers, task.id))}
              {!submitted ? (
                <>
                  {" "}
                  <button type="button" onClick={() => clearTask(task.id)}>
                    Очистить
                  </button>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
