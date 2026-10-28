import { useState } from "react";
import trainingData from "../../course/data/training-set.json";
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
  const [selectedTaskId, setSelectedTaskId] = useState(() => trainingSet.tasks[0]?.id ?? "");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const tasks = trainingSet.tasks;
  const selectedIndex = tasks.findIndex((task) => task.id === selectedTaskId);
  const selectedTask = tasks[selectedIndex];
  const missing = tasks.filter((task) => !isFilled(task, answers[task.id]));
  const filled = tasks.length - missing.length;

  function saveAnswer(answer: Answer) {
    if (!submitted) setAnswers((current) => ({ ...current, [answer.taskId]: answer }));
  }
  function finish() {
    if (missing.length > 0) setShowWarning(true);
    else setSubmitted(true);
  }
  function startAgain() {
    setAnswers({});
    setSelectedTaskId(tasks[0]?.id ?? "");
    setShowWarning(false);
    setSubmitted(false);
  }

  return (
    <main className="trainer">
      <div className="brand"><span className="brand-mark" aria-hidden="true">W.</span> Учебный тренажёр</div>
      <header className="module-header">
        <p className="eyebrow">Учебный модуль</p>
        <h1>{trainingSet.title}</h1>
        <p className="module-description">{submitted ? "Попытка завершена. Ниже можно посмотреть ваши ответы." : "Отвечайте в удобном порядке. Ответы сохраняются во время этой попытки."}</p>
        <div className="progress-summary" aria-live="polite">
          <p>Заполнено: {filled} из {tasks.length}</p>
          <progress value={filled} max={tasks.length || 1} aria-label="Прогресс заполнения" />
          {missing.length > 0 ? <p>Не заполнены: {missing.map((task) => tasks.indexOf(task) + 1).join(", ")}</p> : <p>Все задания заполнены</p>}
        </div>
      </header>

      {tasks.length === 0 ? (
        <section className="empty-state"><h2>В этом модуле пока нет заданий</h2><p>Задания появятся здесь, когда модуль будет подготовлен.</p></section>
      ) : (
        <>
          <div className="workspace">
            <TaskList tasks={tasks} selectedTaskId={selectedTaskId} onChoose={setSelectedTaskId} filledIds={new Set(tasks.filter((task) => isFilled(task, answers[task.id])).map((task) => task.id))} />
            {selectedTask ? <div><TaskCard task={selectedTask} answer={answers[selectedTask.id]} onAnswer={saveAnswer} disabled={submitted} />
              <div className="actions navigation">
                <button type="button" disabled={selectedIndex <= 0} onClick={() => setSelectedTaskId(tasks[selectedIndex - 1].id)}>Назад</button>
                <button type="button" disabled={selectedIndex >= tasks.length - 1} onClick={() => setSelectedTaskId(tasks[selectedIndex + 1].id)}>Вперёд</button>
              </div>
            </div> : <section className="empty-state"><h2>Выберите задание</h2><p>Текущее задание отсутствует в модуле.</p></section>}
          </div>
          {!submitted && <div className="finish-area"><button className="primary-button" type="button" onClick={finish}>Завершить попытку</button></div>}
          {submitted && (
        <section className="review" aria-labelledby="review-title">
          <h2 id="review-title">Обзор ответов</h2>
          {tasks.map((task, index) => {
            const answer = answers[task.id];
            let display = "Нет ответа";
            if (isFilled(task, answer) && answer) {
              if (task.kind === "single-choice" && answer.kind === "single-choice") display = task.options.find((option) => option.id === answer.optionId)?.label ?? answer.optionId;
              if (answer.kind === "short-text") display = answer.text;
            }
            return <article className="review-item" key={task.id}><h3>{index + 1}. {task.prompt}</h3><p className="review-answer">{display}</p></article>;
          })}
          <button className="primary-button" type="button" onClick={startAgain}>Начать новую попытку</button>
        </section>
          )}
          {showWarning && <section className="warning" role="alert" aria-labelledby="warning-title"><h2 id="warning-title">Есть незаполненные задания</h2><p>Пропущены: {missing.map((task) => tasks.indexOf(task) + 1).join(", ")}. Завершить попытку?</p><div className="actions"><button type="button" onClick={() => setShowWarning(false)}>Продолжить отвечать</button><button className="primary-button" type="button" onClick={() => { setShowWarning(false); setSubmitted(true); }}>Завершить с пропусками</button></div></section>}
        </>
      )}
      <footer className="footer">Веб-программирование <span>Локальная тренировка</span></footer>
    </main>
  );
}
