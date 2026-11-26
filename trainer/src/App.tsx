import { useEffect, useState } from "react";
import { AttemptReview } from "./AttemptReview";
import { type FormEvent } from "./AnswerField";
import { TaskCard } from "./TaskCard";
import { TaskList } from "./TaskList";
import {
  ApiError,
  createAttempt,
  deleteAnswer,
  getAttempt,
  getResult,
  getSet,
  getSets,
  putAnswer,
  submitAttempt,
  type AttemptResult,
  type ServerAttempt,
} from "./api/trainerApi";
import {
  countProgress,
  findAnswer,
  isAnswered,
  type Answer,
  type TrainingSet,
} from "./domain";

type Screen = "task" | "review";

type Retry =
  | { type: "load" }
  | { type: "start" }
  | { type: "put"; answer: Answer }
  | { type: "delete"; taskId: string }
  | { type: "submit" };

const ATTEMPT_KEY = "trainer-attempt-id";

function sameAnswer(a: Answer | undefined, b: Answer | undefined): boolean {
  if (!isAnswered(a) && !isAnswered(b)) return true;
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "short-text" && b.kind === "short-text") return a.text === b.text;
  if (a.kind === "single-choice" && b.kind === "single-choice") {
    return a.optionId === b.optionId;
  }
  return false;
}

function errorText(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Ошибка запроса";
}

export default function App() {
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);
  const [attempt, setAttempt] = useState<ServerAttempt | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [screen, setScreen] = useState<Screen>("task");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [restoreMessage, setRestoreMessage] = useState("");
  const [demoFail, setDemoFail] = useState(false);
  const [retry, setRetry] = useState<Retry | null>(null);

  function takeDemoFail() {
    if (!demoFail) return false;
    setDemoFail(false);
    return true;
  }

  async function guard(nextRetry: Retry, job: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await job();
      setRetry(null);
      return true;
    } catch (e) {
      setNote("");
      setError(errorText(e));
      setRetry(nextRetry);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function loadAll() {
    const fail = takeDemoFail();
    setBusy(true);
    setError("");
    setRetry(null);
    try {
      const sets = await getSets(fail);
      const first = sets[0];
      if (!first) throw new Error("Сервер не вернул модули");
      const loaded = await getSet(first.id, fail);
      setTrainingSet(loaded);

      const savedId = localStorage.getItem(ATTEMPT_KEY);
      if (!savedId) {
        setAttempt(null);
        setAnswers([]);
        setResult(null);
        setRestoreMessage(
          "Сохранённого идентификатора попытки нет. Восстановить подтверждённую попытку нельзя.",
        );
        return;
      }

      try {
        const data = await getAttempt(savedId, fail);
        setAttempt(data);
        setAnswers(data.answers);
        setRestoreMessage("");
        if (data.status === "submitted") {
          const loadedResult = await getResult(savedId, fail);
          setResult(loadedResult);
          setScreen("review");
        } else {
          setResult(null);
          setScreen("task");
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          localStorage.removeItem(ATTEMPT_KEY);
          setAttempt(null);
          setAnswers([]);
          setResult(null);
          setRestoreMessage(
            "Сервер не нашёл попытку с сохранённым идентификатором. Восстановить подтверждённую попытку нельзя.",
          );
          return;
        }
        throw e;
      }
    } catch (e) {
      setError(errorText(e));
      setRetry({ type: "load" });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function beginAttempt() {
    if (!trainingSet) return;
    const fail = takeDemoFail();
    await guard({ type: "start" }, async () => {
      const created = await createAttempt(trainingSet.id, fail);
      localStorage.setItem(ATTEMPT_KEY, created.id);
      setAttempt(created);
      setAnswers([]);
      setResult(null);
      setCurrentIndex(0);
      setScreen("task");
      setRestoreMessage("");
      setNote("Сервер создал попытку");
    });
  }

  async function putSaved(answer: Answer) {
    if (!attempt || attempt.status !== "in-progress") return;
    const fail = takeDemoFail();
    await guard({ type: "put", answer }, async () => {
      const updated = await putAnswer(attempt.id, answer, fail);
      setAttempt(updated);
      setAnswers((prev) => [
        ...prev.filter((item) => item.taskId !== answer.taskId),
        ...updated.answers.filter((item) => item.taskId === answer.taskId),
      ]);
      setNote("Сервер подтвердил сохранение");
    });
  }

  async function deleteSaved(taskId: string) {
    if (!attempt || attempt.status !== "in-progress") return;
    const fail = takeDemoFail();
    await guard({ type: "delete", taskId }, async () => {
      const updated = await deleteAnswer(attempt.id, taskId, fail);
      setAttempt(updated);
      setAnswers((prev) => prev.filter((item) => item.taskId !== taskId));
      setNote("Сервер подтвердил удаление");
    });
  }

  async function finish(skipConfirm = false) {
    if (!trainingSet || !attempt || attempt.status !== "in-progress") return;

    const skipped = trainingSet.tasks.filter(
      (task) => !isAnswered(findAnswer(answers, task.id)),
    );
    if (!skipConfirm && skipped.length > 0) {
      const names = skipped.map((task) => task.id).join(", ");
      const ok = window.confirm(
        `Не все задания заполнены (${names}). Завершить?`,
      );
      if (!ok) return;
    }

    const localAnswers = answers;
    const attemptId = attempt.id;
    let serverAttempt = attempt;
    const fail = takeDemoFail();

    await guard({ type: "submit" }, async () => {
      for (const task of trainingSet.tasks) {
        const local = findAnswer(localAnswers, task.id);
        const remote = findAnswer(serverAttempt.answers, task.id);
        if (isAnswered(local) && local && !sameAnswer(local, remote)) {
          serverAttempt = await putAnswer(attemptId, local, fail);
        } else if (!isAnswered(local) && remote) {
          serverAttempt = await deleteAnswer(attemptId, task.id, fail);
        }
      }
      const loadedResult = await submitAttempt(attemptId, fail);
      setAttempt({ ...serverAttempt, status: "submitted" });
      setAnswers(serverAttempt.answers);
      setResult(loadedResult);
      setScreen("review");
      setNote("Попытка отправлена");
    });
  }

  function onRetry() {
    if (!retry) return;
    if (retry.type === "load") {
      void loadAll();
      return;
    }
    if (retry.type === "start") {
      void beginAttempt();
      return;
    }
    if (retry.type === "put") {
      const fresh = findAnswer(answers, retry.answer.taskId);
      void putSaved(fresh && isAnswered(fresh) ? fresh : retry.answer);
      return;
    }
    if (retry.type === "delete") {
      void deleteSaved(retry.taskId);
      return;
    }
    void finish(true);
  }

  function handleFormEvent(event: FormEvent) {
    const answer: Answer =
      event.type === "choose"
        ? { taskId: event.taskId, kind: "single-choice", optionId: event.optionId }
        : { taskId: event.taskId, kind: "short-text", text: event.text };

    setNote("");
    setAnswers((prev) => [
      ...prev.filter((item) => item.taskId !== answer.taskId),
      answer,
    ]);

    if (event.type === "choose") void putSaved(answer);
  }

  function saveCurrent() {
    if (!task) return;
    const answer = findAnswer(answers, task.id);
    if (!answer || !isAnswered(answer)) {
      const saved = attempt && findAnswer(attempt.answers, task.id);
      if (!saved) {
        setError("");
        setNote("Пустой ответ на сервер не отправляется");
        return;
      }
      void deleteSaved(task.id);
      return;
    }
    void putSaved(answer);
  }

  function goTo(index: number) {
    if (!trainingSet) return;
    const last = trainingSet.tasks.length - 1;
    const next = Math.max(0, Math.min(index, last));
    setCurrentIndex(next);
    setScreen("task");
  }

  const task = trainingSet?.tasks[currentIndex];
  const progress = trainingSet ? countProgress(trainingSet, answers) : null;
  const skipped =
    trainingSet?.tasks.filter(
      (item) => !isAnswered(findAnswer(answers, item.id)),
    ) ?? [];
  const canEdit = attempt?.status === "in-progress";

  return (
    <main>
      <h1>{trainingSet ? trainingSet.title : "Тренажёр"}</h1>
      <p>
        <label>
          <input
            type="checkbox"
            checked={demoFail}
            onChange={(event) => setDemoFail(event.target.checked)}
          />{" "}
          Сломать следующий запрос (сервер вернёт 500)
        </label>
      </p>
      {busy ? <p>Запрос выполняется, кнопки временно недоступны.</p> : null}
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {note ? <p className="ok">{note}</p> : null}
      {retry ? (
        <p>
          <button type="button" disabled={busy} onClick={onRetry}>
            Повторить
          </button>
        </p>
      ) : null}

      {!trainingSet ? <p>Загрузка модуля...</p> : null}

      {trainingSet && !attempt ? (
        <>
          <h2>Заданий: {trainingSet.tasks.length}</h2>
          {restoreMessage ? <p>{restoreMessage}</p> : null}
          <ul>
            {trainingSet.tasks.map((item) => (
              <li key={item.id}>
                {item.id}. {item.prompt}
              </li>
            ))}
          </ul>
          <button type="button" disabled={busy} onClick={() => void beginAttempt()}>
            Начать попытку
          </button>
        </>
      ) : null}

      {trainingSet && attempt && progress ? (
        <>
          <h2>Вопросов: {trainingSet.tasks.length}</h2>
          <p>
            Попытка {attempt.id}, статус {attempt.status}. Идентификатор записан в
            браузере и нужен после перезагрузки.
          </p>
          <p aria-live="polite">
            Прогресс: {progress.filled} из {progress.total}
          </p>
          <p>
            Пропуски:{" "}
            {skipped.length === 0
              ? "нет"
              : skipped.map((item) => item.id).join(", ")}
          </p>
          <p>
            Выбор варианта уходит на сервер сразу. Текст сохраняется кнопкой
            «Сохранить ответ» или при завершении попытки.
          </p>

          <div className="layout">
            <section>
              <h2>Список</h2>
              <TaskList
                tasks={trainingSet.tasks}
                selectedId={task?.id ?? ""}
                disabled={!canEdit || busy}
                onChoose={(id) => {
                  const index = trainingSet.tasks.findIndex((item) => item.id === id);
                  goTo(index);
                }}
              />
            </section>

            <section>
              {screen === "task" && canEdit ? (
                <>
                  <h2>
                    Задание {currentIndex + 1} из {trainingSet.tasks.length}
                  </h2>
                  <TaskCard
                    task={task}
                    answer={findAnswer(answers, task?.id ?? "")}
                    onChange={handleFormEvent}
                    disabled={!canEdit || busy}
                  />
                  <p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => task && void deleteSaved(task.id)}
                    >
                      Очистить ответ
                    </button>{" "}
                    <button type="button" disabled={busy} onClick={saveCurrent}>
                      Сохранить ответ
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      disabled={busy || currentIndex === 0}
                      onClick={() => goTo(currentIndex - 1)}
                    >
                      Назад
                    </button>{" "}
                    <button
                      type="button"
                      disabled={busy || currentIndex >= trainingSet.tasks.length - 1}
                      onClick={() => goTo(currentIndex + 1)}
                    >
                      Далее
                    </button>{" "}
                    <button type="button" disabled={busy} onClick={() => setScreen("review")}>
                      К обзору
                    </button>{" "}
                    <button type="button" disabled={busy} onClick={() => void finish()}>
                      Завершить
                    </button>
                  </p>
                </>
              ) : (
                <AttemptReview
                  tasks={trainingSet.tasks}
                  answers={answers}
                  result={result}
                  canEdit={canEdit}
                  busy={busy}
                  onClear={(taskId) => void deleteSaved(taskId)}
                  onBack={() => setScreen("task")}
                  onFinish={() => void finish()}
                  onRestart={() => void beginAttempt()}
                />
              )}
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}
