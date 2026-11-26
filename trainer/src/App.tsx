import { useState } from "react";
import { type FormEvent } from "./AnswerField";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import {
  countProgress,
  findAnswer,
  isAnswered,
  type Answer,
  type Task,
  type TrainingSet,
} from "./domain";

type AttemptStatus = "in-progress" | "submitted";
type Screen = "task" | "review";

type AttemptState = {
  answers: Answer[];
  currentIndex: number;
  status: AttemptStatus;
};

const set: TrainingSet = {
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

function formatAnswer(task: Task, answer: Answer | undefined): string {
  if (!isAnswered(answer) || !answer) {
    return "нет ответа";
  }
  if (answer.kind === "short-text") {
    return answer.text;
  }
  if (task.kind !== "single-choice") {
    return answer.optionId;
  }
  const option = task.options.find((item) => item.id === answer.optionId);
  return option ? `${option.id}. ${option.label}` : answer.optionId;
}

export default function App() {
  const [attempt, setAttempt] = useState<AttemptState>({
    answers: [],
    currentIndex: 0,
    status: "in-progress",
  });
  const [screen, setScreen] = useState<Screen>("task");

  const { answers, currentIndex, status } = attempt;
  const task = set.tasks[currentIndex];
  const progress = countProgress(set, answers);
  const skipped = set.tasks.filter(
    (item) => !isAnswered(findAnswer(answers, item.id)),
  );
  const canEdit = status === "in-progress";

  const replaceAnswer = (next: Answer) => {
    if (!canEdit) return;
    setAttempt((current) => ({
      ...current,
      answers: [
        ...current.answers.filter((item) => item.taskId !== next.taskId),
        next,
      ],
    }));
  };

  const handleFormEvent = (event: FormEvent) => {
    if (event.type === "choose") {
      replaceAnswer({
        taskId: event.taskId,
        kind: "single-choice",
        optionId: event.optionId,
      });
      return;
    }
    replaceAnswer({
      taskId: event.taskId,
      kind: "short-text",
      text: event.text,
    });
  };

  const goTo = (index: number) => {
    setAttempt((current) => ({
      ...current,
      currentIndex: Math.max(0, Math.min(index, set.tasks.length - 1)),
    }));
    setScreen("task");
  };

  const finish = () => {
    if (!canEdit) return;
    if (skipped.length > 0) {
      const names = skipped.map((item) => item.id).join(", ");
      const ok = window.confirm(
        `Не все задания заполнены (${names}). Завершить?`,
      );
      if (!ok) return;
    }
    setAttempt((current) => ({ ...current, status: "submitted" }));
    setScreen("review");
  };

  const restart = () => {
    setAttempt({ answers: [], currentIndex: 0, status: "in-progress" });
    setScreen("task");
  };

  return (
    <main>
      <h1>
        {set.title}
      </h1>
      <h2>
       Вопросов: {set.tasks.length}
      </h2>
      <p aria-live="polite">
        Прогресс: {progress.filled} из {progress.total}
      </p>
      <p>
        Пропуски:{" "}
        {skipped.length === 0
          ? "нет"
          : skipped.map((item) => item.id).join(", ")}
      </p>

      <div className="layout">
        <section>
          <h2>Список</h2>
          <TaskList
            tasks={set.tasks}
            selectedId={task?.id ?? ""}
            disabled={!canEdit}
            onChoose={(id) => {
              const index = set.tasks.findIndex((item) => item.id === id);
              goTo(index);
            }}
          />
        </section>

        <section>
          {screen === "task" && canEdit ? (
            <>
              <h2>
                Задание {currentIndex + 1} из {set.tasks.length}
              </h2>
              <TaskCard
                task={task}
                answer={findAnswer(answers, task?.id ?? "")}
                onChange={handleFormEvent}
                disabled={!canEdit}
              />
              <p>
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => goTo(currentIndex - 1)}
                >
                  Назад
                </button>{" "}
                {currentIndex < set.tasks.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goTo(currentIndex + 1)}
                  >
                    Далее
                  </button>
                ) : (
                  <button type="button" onClick={() => setScreen("review")}>
                    К обзору
                  </button>
                )}{" "}
                <button type="button" onClick={finish}>
                  Завершить
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>{canEdit ? "Обзор ответов" : "Попытка завершена"}</h2>
              {!canEdit ? (
                <p>Редактирование ответов недоступно. Вы можете начать новую попытку</p>
              ) : null}
              <ul>
                {set.tasks.map((item) => (
                  <li key={item.id}>
                    {item.id}: {formatAnswer(item, findAnswer(answers, item.id))}
                  </li>
                ))}
              </ul>
              <p>
                {canEdit ? (
                  <>
                    <button type="button" onClick={() => setScreen("task")}>
                      К заданиям
                    </button>{" "}
                    <button type="button" onClick={finish}>
                      Завершить
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={restart}>
                    Новая попытка
                  </button>
                )}
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
