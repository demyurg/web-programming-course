import { useState } from "react";
import type { TrainingSet, Answer, Task } from "./domain";
import { getProgress } from "./domain";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { Overview } from "./components/Overview";

import trainingSetData from "../../course/data/training-set.json";
const mainSet = trainingSetData as TrainingSet;

export default function App() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"in-progress" | "submitted">("in-progress");
  const [showConfirm, setShowConfirm] = useState(false);

  const tasks = mainSet.tasks;
  const currentTask = tasks[currentIndex];

  // Производное значение прогресса
  const progress = getProgress(mainSet, Object.values(answers));

  // Вспомогательная функция для проверки заполненности (с учетом пробелов)
  const isAnswered = (task: Task, ans: Answer | undefined) => {
    if (!ans) return false;
    if (task.kind === "short-text" && ans.kind === "short-text") {
      return ans.text.trim().length > 0;
    }
    return true;
  };

  // Список номеров пропущенных заданий
  const missedTasks = tasks
    .map((t, i) => (!isAnswered(t, answers[t.id]) ? i + 1 : null))
    .filter((n): n is number => n !== null);

  function handleAnswer(answer: Answer) {
    // Неизменяемое обновление
    setAnswers((prev) => ({ ...prev, [answer.taskId]: answer }));
  }

  function handleFinish() {
    if (missedTasks.length > 0) {
      setShowConfirm(true); // Есть пропуски — показываем предупреждение
    } else {
      setStatus("submitted");
    }
  }

  function handleRestart() {
    setAnswers({});
    setCurrentIndex(0);
    setStatus("in-progress");
    setShowConfirm(false);
  }

  // Блокировка редактирования после завершения
  if (status === "submitted") {
    return <Overview trainingSet={mainSet} answers={answers} onRestart={handleRestart} />;
  }

  return (
    <div>
      <h1>{mainSet.title}</h1>
      <p><strong>Заполнено:</strong> {progress.filled} / {progress.total}</p>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Навигация по заданиям */}
        <div style={{ flex: "1 1 200px" }}>
          <TaskList 
            tasks={tasks} 
            currentIndex={currentIndex} 
            answers={answers} 
            onSelect={setCurrentIndex} 
          />
        </div>

        {/* Сама форма задания */}
        <div style={{ flex: "3 1 400px" }}>
          <TaskCard 
            task={currentTask} 
            answer={answers[currentTask.id]} 
            onChange={handleAnswer} 
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button 
              className="btn-secondary" 
              onClick={() => setCurrentIndex(i => i - 1)} 
              disabled={currentIndex === 0}
            >
              Назад
            </button>
            
            {currentIndex < tasks.length - 1 ? (
              <button onClick={() => setCurrentIndex(i => i + 1)}>Далее</button>
            ) : (
              <button onClick={handleFinish}>Завершить</button>
            )}
          </div>
        </div>
      </div>

      {/* Модалка подтверждения */}
      {showConfirm && (
        <div className="card" style={{ borderLeft: "4px solid #dc3545" }}>
          <p>
            Вы не ответили на задания: <strong>{missedTasks.join(", ")}</strong>.
          </p>
          <p>Вы уверены, что хотите завершить попытку?</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button className="btn-danger" onClick={() => { setShowConfirm(false); setStatus("submitted"); }}>
              Да, завершить
            </button>
            <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
              Вернуться
            </button>
          </div>
        </div>
      )}
    </div>
  );
}