import { useEffect, useReducer, useRef, useState } from "react";
import {
  countProgress,
  findAnswer,
  isAnswerFilled,
  type Answer,
} from "./domain";
import { trainingSet } from "./set";
import { TaskCard } from "./components/TaskCard";
import {
  createAttemptReducer,
  createInitialDraft,
  parseDraft,
} from "./attempt";
import {
  readDraftRaw,
  removeDraft,
  writeDraft,
} from "./draftStorage";

const attemptReducer = createAttemptReducer(trainingSet.tasks);

type StorageNotice = {
  text: string;
  canReset: boolean;
};

export default function App() {
  const [state, dispatch] = useReducer(
    attemptReducer,
    trainingSet,
    createInitialDraft
  );

  const [storageReady, setStorageReady] = useState(false);
  const [storageNotice, setStorageNotice] =
    useState<StorageNotice | null>(null);

  const skipPersistRef = useRef(true);
  const didReadRef = useRef(false);
  const draftBlockedRef = useRef(false);

  // Чтение и проверка черновика
  useEffect(() => {
    if (didReadRef.current) return;
    didReadRef.current = true;

    const result = readDraftRaw();

    if (!result.ok) {
      setStorageNotice({
        text: "Не удалось прочитать черновик из localStorage. Ввод продолжается в этой вкладке.",
        canReset: false,
      });
      setStorageReady(true);
      return;
    }

    if (result.value === null) {
      setStorageReady(true);
      return;
    }

    const validation = parseDraft(result.value, trainingSet);

    if (validation.kind === "invalid") {
      // Запрещаем автоматическую перезапись повреждённых данных
      draftBlockedRef.current = true;

      setStorageNotice({
        text: `${validation.message} Сохранение приостановлено до явного сброса.`,
        canReset: true,
      });

      setStorageReady(true);
      return;
    }

    dispatch({ type: "restored", draft: validation.draft });
    setStorageReady(true);
  }, []);

  // Сохранение черновика
  useEffect(() => {
    if (!storageReady || draftBlockedRef.current) return;

    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }

    const result = writeDraft(state);

    if (!result.ok) {
      setStorageNotice(previous =>
        previous?.canReset
          ? previous
          : {
              text: "Не удалось сохранить черновик; ввод продолжается в этой вкладке.",
              canReset: false,
            }
      );
      return;
    }

    setStorageNotice(previous =>
      previous?.canReset ? previous : null
    );
  }, [state, storageReady]);

  const tasks = trainingSet.tasks;
  const totalTasks = tasks.length;

  const currentIndex = tasks.findIndex(
    task => task.id === state.taskId
  );

  const safeIndex = Math.max(0, currentIndex);
  const currentTask = tasks[safeIndex];

  const currentAnswer = currentTask
    ? findAnswer(state.answers, currentTask.id)
    : undefined;

  const progress = countProgress(trainingSet, state.answers);

  // Переход между заданиями
  const moveTo = (index: number) => {
    if (index >= 0 && index < totalTasks) {
      dispatch({
        type: "moved",
        taskId: tasks[index].id,
      });
    }
  };

  // Завершение попытки
  const handleFinish = () => {
    if (state.status === "submitted") return;

    const unfilled = tasks.flatMap((task, index) => {
      const answer = findAnswer(state.answers, task.id);

      return !answer || !isAnswerFilled(answer)
        ? [`${index + 1}. ${task.prompt}`]
        : [];
    });

    if (
      unfilled.length > 0 &&
      !window.confirm(
        "Есть незаполненные задания:\n" +
          unfilled.map(task => "- " + task).join("\n") +
          "\n\nЗавершить попытку?"
      )
    ) {
      return;
    }

    dispatch({ type: "submitted" });
  };

  // Явный сброс черновика
  const handleReset = () => {
    const result = removeDraft();

    // Разрешаем сохранение только после явного сброса
    draftBlockedRef.current = false;
    skipPersistRef.current = true;

    dispatch({
      type: "reset",
      draft: createInitialDraft(trainingSet),
    });

    setStorageReady(true);

    setStorageNotice(
      result.ok
        ? null
        : {
            text: "Не удалось удалить старый черновик, но новая попытка уже начата.",
            canReset: false,
          }
    );
  };

  const storageBanner = storageNotice && (
    <div
      className="storage-notice storage-notice--warning"
      role="status"
    >
      <p>{storageNotice.text}</p>

      {storageNotice.canReset && (
        <button type="button" onClick={handleReset}>
          Сбросить черновик
        </button>
      )}
    </div>
  );

  // Пустой набор заданий
  if (totalTasks === 0) {
    return (
      <main>
        {storageBanner}

        <header>
          <h1>{trainingSet.title}</h1>
          <p>Заданий в наборе: 0</p>
        </header>

        <p>В наборе нет заданий.</p>
      </main>
    );
  }

  // Завершённая попытка
  if (state.status === "submitted") {
    return (
      <main>
        {storageBanner}

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
            const answer = findAnswer(state.answers, task.id);
            const filled =
              answer !== undefined && isAnswerFilled(answer);

            return (
              <article key={task.id} className="task-card">
                <p>
                  Задание {index + 1}. Тема: {task.topic}
                </p>

                <h3>{task.prompt}</h3>

                {task.code !== undefined && (
                  <pre>{task.code}</pre>
                )}

                {task.kind === "single-choice" ? (
                  <div>
                    <p>Варианты:</p>

                    <ul>
                      {task.options.map(option => {
                        const selected =
                          answer?.kind === "single-choice" &&
                          answer.optionId === option.id;

                        return (
                          <li key={option.id}>
                            {selected ? (
                              <strong>
                                {option.label} (выбрано)
                              </strong>
                            ) : (
                              option.label
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {!filled && <p>Ответ не выбран.</p>}
                  </div>
                ) : (
                  <div>
                    <p>Ответ:</p>

                    {filled && answer?.kind === "short-text" ? (
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
          <button type="button" onClick={handleReset}>
            Начать новую попытку
          </button>
        </div>
      </main>
    );
  }

  // Основной экран
  return (
    <main>
      {storageBanner}

      <header>
        <h1>{trainingSet.title}</h1>

        <p>
          Задание {safeIndex + 1} / {totalTasks}
        </p>

        <p>
          Прогресс: {progress.filled} / {progress.total}
        </p>
      </header>

      {currentTask ? (
        <TaskCard
          task={currentTask}
          answer={currentAnswer}
          onAnswerChange={(answer: Answer) =>
            dispatch({ type: "answerChanged", answer })
          }
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
        <button
          type="button"
          onClick={() => moveTo(safeIndex - 1)}
          disabled={safeIndex === 0}
        >
          Назад
        </button>

        {safeIndex < totalTasks - 1 && (
          <button
            type="button"
            onClick={() => moveTo(safeIndex + 1)}
          >
            Дальше
          </button>
        )}

        <button type="button" onClick={handleFinish}>
          Завершить попытку
        </button>
      </div>
    </main>
  );
}
