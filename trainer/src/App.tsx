import { useEffect, useReducer, useRef, useState } from "react";
import {
  createAttempt,
  deleteAnswer,
  getAttempt,
  getResult,
  getSets,
  getTrainingSet,
  putAnswer,
  submitAttempt,
} from "./api/trainerApi";
import { AttemptReview } from "./components/AttemptReview";
import { TaskCard } from "./components/TaskCard";
import { TaskList } from "./components/TaskList";
import {
  applyAttemptAction,
  countProgress,
  createAttemptState,
  getAnswer,
  isAnswered,
  type AttemptResult,
  type FormEvent,
  type TrainingSet,
} from "./domain";

const ATTEMPT_KEY = "attemptId";

export default function App() {
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [confirmedAnswers, setConfirmedAnswers] = useState(
    createAttemptState().answers
  );
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [attempt, dispatch] = useReducer(
    applyAttemptAction,
    createAttemptState()
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [demoFail, setDemoFail] = useState(false);
  const retryRef = useRef<(() => void) | null>(null);

  const tasks = trainingSet?.tasks ?? [];
  const currentTask = tasks[attempt.currentIndex];
  const progress = trainingSet
    ? countProgress(trainingSet, attempt.answers)
    : { filled: 0, total: 0 };
  const skipped = tasks.filter(
    (task) => !isAnswered(getAnswer(attempt.answers, task.id))
  );
  const submitted = attempt.status === "submitted";

  async function run(action: (fail: boolean) => Promise<void>, fail: boolean) {
    setBusy(true);
    setError(null);
    retryRef.current = () => {
      void run(action, false);
    };

    try {
      await action(fail);
      retryRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setBusy(false);
    }
  }

  function rememberAttempt(id: string) {
    setAttemptId(id);
    try {
      localStorage.setItem(ATTEMPT_KEY, id);
    } catch {
      setInfo("localStorage недоступен, после перезагрузки попытка не восстановится.");
    }
  }

  async function openNewAttempt(setId: string, fail: boolean) {
    const created = await createAttempt(setId, fail);
    rememberAttempt(created.id);
    setConfirmedAnswers(created.answers);
    setResult(null);
    dispatch({ type: "reset" });
  }

  async function loadApp(fail: boolean) {
    const sets = await getSets(fail);
    const first = sets[0];
    if (!first) {
      throw new Error("Сервер не вернул набор заданий.");
    }

    const loadedSet = await getTrainingSet(first.id, fail);
    setTrainingSet(loadedSet);

    let savedId: string | null = null;
    try {
      savedId = localStorage.getItem(ATTEMPT_KEY);
    } catch {
      savedId = null;
    }

    if (!savedId) {
      await openNewAttempt(loadedSet.id, fail);
      setInfo("Создана новая попытка.");
      return;
    }

    let saved;
    try {
      saved = await getAttempt(savedId, fail);
    } catch {
      try {
        localStorage.removeItem(ATTEMPT_KEY);
      } catch {
        // хранилище может быть недоступно
      }
      await openNewAttempt(loadedSet.id, fail);
      setInfo(
        "Нельзя восстановить подтверждённую попытку: нет id или сервер его больше не находит. Создана новая попытка."
      );
      return;
    }

    rememberAttempt(saved.id);
    setConfirmedAnswers(saved.answers);
    dispatch({
      type: "restored",
      answers: saved.answers,
      status: saved.status,
    });

    if (saved.status === "submitted") {
      const savedResult = await getResult(saved.id, fail);
      setResult(savedResult);
    } else {
      setResult(null);
    }

    setInfo("Восстановлена подтверждённая попытка " + saved.id);
  }

  useEffect(() => {
    void run(loadApp, false);
  }, []);

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

  function saveCurrent() {
    if (!attemptId || !currentTask) {
      return;
    }

    const answer = getAnswer(attempt.answers, currentTask.id);
    if (!isAnswered(answer)) {
      setError("Сначала заполните ответ.");
      return;
    }

    void run(async (fail) => {
      const saved = await putAnswer(attemptId, answer, fail);
      setConfirmedAnswers(saved.answers);
      setInfo("Сервер подтвердил сохранение ответа " + currentTask.id);
    }, demoFail);
  }

  function clearTask(taskId: string) {
    if (!attemptId) {
      return;
    }

    void run(async (fail) => {
      const saved = await deleteAnswer(attemptId, taskId, fail);
      setConfirmedAnswers(saved.answers);
      dispatch({ type: "answer-cleared", taskId });
      setInfo("Сервер подтвердил очистку ответа " + taskId);
    }, demoFail);
  }

  function goTo(index: number) {
    dispatch({
      type: "moved",
      index,
      taskCount: tasks.length,
    });
  }

  function finish() {
    if (!attemptId) {
      return;
    }

    if (skipped.length > 0) {
      const ids = skipped.map((task) => task.id).join(", ");
      const ok = confirm("Есть незаполненные задания: " + ids + ". Завершить?");
      if (!ok) {
        return;
      }
    }

    void run(async (fail) => {
      const savedResult = await submitAttempt(attemptId, fail);
      dispatch({ type: "submitted" });
      setResult(savedResult);
      setInfo("Попытка отправлена. Оценку считает сервер.");
    }, demoFail);
  }

  function startNew() {
    if (!trainingSet) {
      return;
    }

    void run(async (fail) => {
      await openNewAttempt(trainingSet.id, fail);
      setInfo("Создана новая попытка.");
    }, demoFail);
  }

  if (!trainingSet) {
    return (
      <main>
        <h1>Тренажёр</h1>
        <p>{busy ? "Загрузка модуля с сервера..." : "Модуль ещё не загружен."}</p>
        {error ? <p>Ошибка: {error}</p> : null}
        {error && retryRef.current ? (
          <button type="button" onClick={() => retryRef.current?.()} disabled={busy}>
            Повторить
          </button>
        ) : null}
      </main>
    );
  }

  return (
    <main>
      <h1>
        {trainingSet.title}. Заданий: {trainingSet.tasks.length}
      </h1>
      <p>Попытка: {attemptId ?? "нет"}</p>
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
      {info ? <p>{info}</p> : null}
      {error ? <p>Ошибка: {error}. Локальный ввод не стёрт.</p> : null}
      {error && retryRef.current ? (
        <button type="button" onClick={() => retryRef.current?.()} disabled={busy}>
          Повторить запрос
        </button>
      ) : null}
      <label>
        <input
          type="checkbox"
          checked={demoFail}
          onChange={(event) => setDemoFail(event.target.checked)}
        />
        Учебная ошибка 500 (заголовок X-Demo-Fail)
      </label>
      <TaskList
        tasks={tasks}
        currentTaskId={currentTask?.id}
        disabled={busy}
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
          disabled={submitted || busy}
          onFormEvent={handleFormEvent}
        />
      ) : (
        <p>Нет выбранного задания.</p>
      )}
      <p>
        Задание {attempt.currentIndex + 1} из {tasks.length}
      </p>
      {!submitted && currentTask ? (
        <button type="button" onClick={saveCurrent} disabled={busy}>
          Сохранить ответ
        </button>
      ) : null}
      {!submitted && currentTask ? (
        <button
          type="button"
          onClick={() => clearTask(currentTask.id)}
          disabled={busy}
        >
          Очистить ответ в карточке
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => goTo(attempt.currentIndex - 1)}
        disabled={busy || attempt.currentIndex === 0}
      >
        Назад
      </button>
      <button
        type="button"
        onClick={() => goTo(attempt.currentIndex + 1)}
        disabled={busy || attempt.currentIndex === tasks.length - 1}
      >
        Далее
      </button>
      {!submitted ? (
        <button type="button" onClick={finish} disabled={busy}>
          Завершить
        </button>
      ) : null}
      <button type="button" onClick={startNew} disabled={busy}>
        Новая попытка
      </button>
      <AttemptReview
        tasks={tasks}
        answers={attempt.answers}
        confirmedAnswers={confirmedAnswers}
        submitted={submitted}
        canClear={!submitted && !busy}
        result={result}
        onClear={clearTask}
      />
    </main>
  );
}
