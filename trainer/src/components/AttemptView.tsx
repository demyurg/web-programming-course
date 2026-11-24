import { useRef, useState } from "react";
import * as api from "../api/trainerApi";
import { isFilled, projectAttempt, updateInput } from "../attempt";
import type { Answer } from "../domain";
import { storeAttemptId } from "../session";
import type { Session } from "../session";
import AttemptReview from "./AttemptReview";
import TaskCard from "./TaskCard";
import TaskList from "./TaskList";

type Operation =
  | { kind: "start" }
  | { kind: "save"; attemptId: string; answer: Answer }
  | { kind: "clear"; attemptId: string; taskId: string }
  | { kind: "submit"; attemptId: string };

const operationLabels = {
  start: "создать попытку",
  save: "сохранить ответ",
  clear: "очистить ответ",
  submit: "отправить попытку",
};

export default function AttemptView({ session }: { session: Session }) {
  const { set } = session;
  const [attempt, setAttempt] = useState(session.attempt);
  const [result, setResult] = useState(session.result);
  const [notice, setNotice] = useState(session.notice);
  const [edits, setEdits] = useState<ReadonlyMap<string, Answer>>(() => new Map());
  const [selectedTaskId, selectTask] = useState(set.tasks[0]?.id);
  const [showWarning, setShowWarning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{ operation: Operation; message: string } | null>(null);
  const inFlight = useRef(false);
  const tasks = set.tasks;

  async function run(operation: Operation) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFailure(null);
    setNotice(null);
    try {
      if (operation.kind === "start") {
        const created = await api.createAttempt(set);
        const saved = storeAttemptId(created.id);
        setAttempt(created);
        setResult(null);
        setEdits(new Map());
        selectTask(tasks[0]?.id);
        setNotice(saved
          ? "Попытка создана на сервере."
          : "Попытка создана, но идентификатор сохранить не удалось. Восстановление недоступно.");
      } else if (operation.kind === "submit") {
        const submitted = await api.submitAttempt(set, operation.attemptId);
        setAttempt((current) => current && { ...current, status: "submitted" });
        setResult(submitted);
        setNotice("Сервер подтвердил отправку попытки.");
      } else {
        const updated = operation.kind === "save"
          ? await api.saveAnswer(set, operation.attemptId, operation.answer)
          : await api.clearAnswer(set, operation.attemptId, operation.taskId);
        const taskId = operation.kind === "save" ? operation.answer.taskId : operation.taskId;
        setAttempt(updated);
        setEdits((current) => {
          const next = new Map(current);
          next.delete(taskId);
          return next;
        });
        setNotice(operation.kind === "save" ? "Сервер подтвердил сохранение ответа." : "Сервер подтвердил очистку ответа.");
      }
    } catch (error) {
      setFailure({ operation, message: error instanceof Error ? error.message : "Неизвестная ошибка." });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const submitted = attempt?.status === "submitted";
  const awaitingSubmit = failure?.operation.kind === "submit";
  const canEdit = !!attempt && !submitted && !awaitingSubmit;
  const canSubmit = canEdit && !busy && !failure && edits.size === 0;
  const view = attempt && projectAttempt(tasks, attempt, edits);
  const selectedIndex = tasks.findIndex(({ id }) => id === selectedTaskId);
  const task = tasks[selectedIndex];
  const activeEdit = task && edits.get(task.id);

  function edit(answer: Answer) {
    if (!attempt || !canEdit || inFlight.current) return;
    setShowWarning(false);
    setEdits((current) => updateInput(attempt, current, answer));
    const operation = failure?.operation;
    if ((operation?.kind === "save" && operation.answer.taskId === answer.taskId) ||
        (operation?.kind === "clear" && operation.taskId === answer.taskId)) setFailure(null);
    setNotice(null);
  }

  function clear(taskId: string) {
    if (!attempt || !canEdit) return;
    setShowWarning(false);
    void run({ kind: "clear", attemptId: attempt.id, taskId });
  }

  function save() {
    if (!attempt || !canEdit || !task || !activeEdit) return;
    if (!isFilled(task, activeEdit)) {
      clear(task.id);
      return;
    }
    void run({ kind: "save", attemptId: attempt.id, answer: activeEdit });
  }

  function submit() {
    if (!attempt || !canSubmit) return;
    setShowWarning(false);
    void run({ kind: "submit", attemptId: attempt.id });
  }

  function finish() {
    if (view?.missingNumbers.length) setShowWarning(true);
    else submit();
  }

  return (
    <>
      <header className="module-header">
        <p className="eyebrow">Учебный модуль</p>
        <h1>{set.title}</h1>
        {view && (
          <div className="progress-summary" aria-live="polite">
            <p>Заполнено: {view.filledIds.size} из {tasks.length}</p>
            <progress value={view.filledIds.size} max={tasks.length || 1} aria-label="Прогресс заполнения" />
            <p>{view.missingNumbers.length > 0 ? `Не заполнены: ${view.missingNumbers.join(", ")}` : "Все задания заполнены"}</p>
          </div>
        )}
      </header>

      {busy && <p role="status">Ожидаем ответ сервера…</p>}
      {notice && <p role="status">{notice}</p>}
      {failure && (
        <section className="warning">
          <p role="alert">Не удалось {operationLabels[failure.operation.kind]}. {failure.message}</p>
          <button type="button" disabled={busy} onClick={() => void run(failure.operation)}>Повторить запрос</button>
        </section>
      )}

      {(!attempt || submitted) && (
        <div className="finish-area">
          <button className="primary-button" type="button" disabled={busy} onClick={() => void run({ kind: "start" })}>
            Начать новую попытку
          </button>
        </div>
      )}

      {view && (
        <>
          {task ? (
            <div className="workspace">
              <TaskList tasks={tasks} selectedTaskId={task.id} onChoose={selectTask} filledIds={view.filledIds} />
              <div>
                <TaskCard task={task} answer={view.answers.get(task.id)} onAnswer={edit} onClear={clear}
                  disabled={!canEdit || busy} canEdit={canEdit} onSave={save} dirty={!!activeEdit}
                  confirmed={view.confirmed.has(task.id)} />
                <div className="actions navigation">
                  <button type="button" disabled={selectedIndex <= 0} onClick={() => selectTask(tasks[selectedIndex - 1].id)}>Назад</button>
                  <button type="button" disabled={selectedIndex >= tasks.length - 1} onClick={() => selectTask(tasks[selectedIndex + 1].id)}>Вперёд</button>
                </div>
              </div>
            </div>
          ) : <p>В этом модуле пока нет заданий.</p>}
          {canEdit && (
            <div className="finish-area">
              {edits.size > 0 && <p>Сохраните изменения в ответах перед отправкой попытки.</p>}
              <button className="primary-button" type="button" disabled={!canSubmit} onClick={finish}>
                Завершить попытку
              </button>
            </div>
          )}
          {showWarning && canEdit && (
            <section className="warning" aria-labelledby="warning-title">
              <h2 id="warning-title">Есть незаполненные задания</h2>
              <p>Пропущены: {view.missingNumbers.join(", ")}. Завершить попытку?</p>
              <div className="actions">
                <button type="button" onClick={() => setShowWarning(false)}>Продолжить отвечать</button>
                <button className="primary-button" type="button" disabled={!canSubmit} onClick={submit}>Завершить с пропусками</button>
              </div>
            </section>
          )}
          <AttemptReview tasks={tasks} answers={view.answers} dirtyIds={edits} filledIds={view.filledIds}
            result={result} canEdit={canEdit} busy={busy} onClear={clear} />
        </>
      )}
    </>
  );
}
