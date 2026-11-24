import { useEffect, useReducer, useState } from "react";
import trainingData from "../../course/data/training-set.json";
import { attemptReducer, draftKey, initialAttempt, readDraft } from "./attempt";
import type { Answer, Task, TrainingSet } from "./domain";
import TaskList from "./components/TaskList";
import TaskCard from "./components/TaskCard";

const defaultSet = trainingData as TrainingSet;

type AppProps = { trainingSet?: TrainingSet };

function isFilled(task: Task, answer: Answer | undefined): boolean {
  if (!answer || answer.taskId !== task.id || answer.kind !== task.kind) return false;
  return answer.kind === "short-text" ? answer.text.trim().length > 0 : answer.optionId.length > 0;
}

export default function App({ trainingSet = defaultSet }: AppProps) {
  return <AttemptView key={trainingSet.id} trainingSet={trainingSet} />;
}

function AttemptView({ trainingSet }: { trainingSet: TrainingSet }) {
  const [{ draft, storage, changed }, dispatch] = useReducer(attemptReducer, trainingSet, initialAttempt);
  const [showWarning, setShowWarning] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    dispatch({ type: "restored", result: readDraft(trainingSet) });
  }, [trainingSet]);

  useEffect(() => {
    if (storage !== "ready" || !changed) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [changed, draft, storage]);

  const selectedTaskId = draft.taskId;
  const submitted = draft.status === "submitted";
  const answers = new Map(draft.answers.map((answer) => [answer.taskId, answer]));
  const tasks = trainingSet.tasks;
  const selectedIndex = tasks.findIndex((task) => task.id === selectedTaskId);
  const selectedTask = tasks[selectedIndex];
  const filledIds = new Set<string>();
  const missingNumbers: number[] = [];
  tasks.forEach((task, index) => {
    if (isFilled(task, answers.get(task.id))) filledIds.add(task.id);
    else missingNumbers.push(index + 1);
  });

  function chooseTask(taskId: string) {
    dispatch({ type: "moved", taskId });
  }

  function saveAnswer(answer: Answer) {
    setShowWarning(false);
    dispatch({ type: "answerChanged", answer });
  }

  function clearAnswer(taskId: string) {
    setShowWarning(false);
    dispatch({ type: "answerCleared", taskId });
  }

  function submitAttempt() {
    setShowWarning(false);
    dispatch({ type: "submitted" });
  }

  function finish() {
    if (missingNumbers.length > 0) setShowWarning(true);
    else submitAttempt();
  }

  function startAgain() {
    setShowWarning(false);
    dispatch({ type: "reset", set: trainingSet });
  }

  return (
    <main className="trainer">
      <div className="brand"><span className="brand-mark" aria-hidden="true">W.</span> Учебный тренажёр</div>
      <header className="module-header">
        <p className="eyebrow">Учебный модуль</p>
        <h1>{trainingSet.title}</h1>
        <p className="module-description">{submitted ? "Попытка завершена. Ниже можно посмотреть ваши ответы." : "Отвечайте в удобном порядке."}</p>
        <div className="progress-summary" aria-live="polite">
          <p>Заполнено: {filledIds.size} из {tasks.length}</p>
          <progress value={filledIds.size} max={tasks.length || 1} aria-label="Прогресс заполнения" />
          {missingNumbers.length > 0 ? <p>Не заполнены: {missingNumbers.join(", ")}</p> : <p>Все задания заполнены</p>}
        </div>
      </header>

      {(storage === "invalid" || storage === "foreign") && (
        <section className="warning" aria-labelledby="draft-warning-title">
          <h2 id="draft-warning-title">Черновик не восстановлен</h2>
          <p role="alert">
            {storage === "foreign"
              ? "Сохранённый черновик относится к другому учебному набору."
              : "Сохранённый черновик повреждён или несовместим с текущим набором."}
            {" "}Сбросьте его, чтобы начать новую попытку с сохранением.
          </p>
          <button type="button" onClick={startAgain}>Сбросить черновик</button>
        </section>
      )}
      {(storage === "unavailable" || saveFailed) && (
        <p className="warning" role="status">
          {saveFailed
            ? "Не удалось сохранить текущие изменения. Они доступны до перезагрузки страницы."
            : "Хранилище браузера недоступно. Ответы будут доступны до перезагрузки страницы."}
        </p>
      )}

      {storage === "loading" ? (
        <p role="status">Проверяем сохранённую попытку…</p>
      ) : tasks.length === 0 ? (
        <section className="empty-state"><h2>В этом модуле пока нет заданий</h2><p>Задания появятся здесь, когда модуль будет подготовлен.</p></section>
      ) : (
        <>
          <div className="workspace">
            <TaskList tasks={tasks} selectedTaskId={selectedTaskId} onChoose={chooseTask} filledIds={filledIds} />
            {selectedTask ? <div><TaskCard task={selectedTask} answer={answers.get(selectedTask.id)} onAnswer={saveAnswer} onClear={clearAnswer} disabled={submitted} />
              <div className="actions navigation">
                <button type="button" disabled={selectedIndex <= 0} onClick={() => chooseTask(tasks[selectedIndex - 1].id)}>Назад</button>
                <button type="button" disabled={selectedIndex >= tasks.length - 1} onClick={() => chooseTask(tasks[selectedIndex + 1].id)}>Вперёд</button>
              </div>
            </div> : <section className="empty-state"><h2>Выберите задание</h2><p>Текущее задание отсутствует в модуле.</p></section>}
          </div>
          {!submitted && <div className="finish-area"><button className="primary-button" type="button" onClick={finish}>Завершить попытку</button></div>}
          <section className="review" aria-labelledby="review-title">
            <h2 id="review-title">Обзор ответов</h2>
            {tasks.map((task, index) => {
              const answer = answers.get(task.id);
              let display = "Нет ответа";
              if (filledIds.has(task.id) && answer) {
                if (task.kind === "single-choice" && answer.kind === "single-choice") {
                  display = task.options.find((option) => option.id === answer.optionId)?.label ?? answer.optionId;
                }
                if (answer.kind === "short-text") display = answer.text;
              }
              return (
                <article className="review-item" key={task.id}>
                  <h3>{index + 1}. {task.prompt}</h3>
                  <p className="review-answer">{display}</p>
                  {answer && !submitted && (
                    <button type="button" onClick={() => clearAnswer(task.id)}>Очистить ответ к заданию {index + 1}</button>
                  )}
                </article>
              );
            })}
            {submitted && <button className="primary-button" type="button" onClick={startAgain}>Начать новую попытку</button>}
          </section>
          {showWarning && missingNumbers.length > 0 && <section className="warning" role="alert" aria-labelledby="warning-title"><h2 id="warning-title">Есть незаполненные задания</h2><p>Пропущены: {missingNumbers.join(", ")}. Завершить попытку?</p><div className="actions"><button type="button" onClick={() => setShowWarning(false)}>Продолжить отвечать</button><button className="primary-button" type="button" onClick={submitAttempt}>Завершить с пропусками</button></div></section>}
        </>
      )}
      <footer className="footer">Веб-программирование <span>Локальная тренировка</span></footer>
    </main>
  );
}
