import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import {
  countProgress,
  getAnswer,
  isAnswered,
  type Answer,
  type AttemptStatus,
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

function replaceAnswer(current: Answer[], next: Answer): Answer[] {
  return [...current.filter((item) => item.taskId !== next.taskId), next];
}

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [status, setStatus] = useState<AttemptStatus>("in-progress");

  const tasks = trainingSet.tasks;
  const currentTask = tasks[currentIndex];
  const progress = countProgress(trainingSet, answers);
  const skipped = tasks.filter(
    (task) => !isAnswered(getAnswer(answers, task.id))
  );
  const submitted = status === "submitted";

  function handleFormEvent(event: FormEvent) {
    if (submitted) {
      return;
    }

    if (event.type === "choose-option") {
      setAnswers((current) =>
        replaceAnswer(current, {
          taskId: event.taskId,
          kind: "single-choice",
          optionId: event.optionId,
        })
      );
      return;
    }

    setAnswers((current) =>
      replaceAnswer(current, {
        taskId: event.taskId,
        kind: "short-text",
        text: event.text,
      })
    );
  }

  function goBack() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, tasks.length - 1));
  }

  function finish() {
    if (skipped.length > 0) {
      const ids = skipped.map((task) => task.id).join(", ");
      const ok = confirm("Есть незаполненные задания: " + ids + ". Завершить?");
      if (!ok) {
        return;
      }
    }

    setStatus("submitted");
  }

  function startNewAttempt() {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("in-progress");
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
      <TaskList
        tasks={tasks}
        disabled={submitted}
        onSelect={(taskId) => {
          const index = tasks.findIndex((task) => task.id === taskId);
          if (index >= 0) {
            setCurrentIndex(index);
          }
        }}
      />
      {submitted ? (
        <section>
          <h2>Обзор ответов</h2>
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {task.id}: {answerText(getAnswer(answers, task.id))}
              </li>
            ))}
          </ul>
        </section>
      ) : currentTask ? (
        <TaskCard
          task={currentTask}
          answer={getAnswer(answers, currentTask.id)}
          disabled={false}
          onFormEvent={handleFormEvent}
        />
      ) : (
        <p>Нет выбранного задания.</p>
      )}
      <p>
        Задание {currentIndex + 1} из {tasks.length}
      </p>
      <button type="button" onClick={goBack} disabled={currentIndex === 0 || submitted}>
        Назад
      </button>
      <button
        type="button"
        onClick={currentIndex === tasks.length - 1 ? finish : goNext}
        disabled={submitted}
      >
        {currentIndex === tasks.length - 1 ? "К обзору" : "Далее"}
      </button>
      <button type="button" onClick={finish} disabled={submitted}>
        Завершить
      </button>
      <button type="button" onClick={startNewAttempt}>
        Новая попытка
      </button>
    </main>
  );
}
