import { useState } from "react";
import { mainSet } from "./data";
import type { Answer } from "./domain";
import { getProgress } from "./domain";
import TaskList from "./TaskList";
import TaskCard from "./TaskCard";

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [status, setStatus] = useState<"in-progress" | "submitted">("in-progress");

  if (mainSet.tasks.length === 0) {
    return (
      <div>
        <h1>{mainSet.title}</h1>
        <p>В модуле пока нет заданий.</p>
      </div>
    );
  }

  const currentTask = mainSet.tasks[currentIndex];
  const currentAnswer = answers.find((a) => a.taskId === currentTask.id);

  function replaceAnswer(next: Answer) {
    setAnswers((current) => [
      ...current.filter((item) => item.taskId !== next.taskId),
      next,
    ]);
  }

  const progress = getProgress(mainSet, answers);

  function handleFinish() {
    const missedTasks = mainSet.tasks.filter((task) => {
      const ans = answers.find((a) => a.taskId === task.id);
      if (!ans) return true;
      if (ans.kind === "single-choice") return ans.optionId.trim() === "";
      if (ans.kind === "short-text") return ans.text.trim().length === 0;
      return false;
    });

    if (missedTasks.length > 0) {
      const ids = missedTasks.map((t) => t.id).join(", ");
      if (!window.confirm(`Вы не ответили на задания: ${ids}. Завершить попытку?`)) {
        return;
      }
    }
    setStatus("submitted");
  }

  function handleRestart() {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("in-progress");
  }

  if (status === "submitted") {
    return (
      <div>
        <h1>{mainSet.title} — Результаты</h1>
        <p>Заполнено: {progress.filled} из {progress.total}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {mainSet.tasks.map((task) => {
            const ans = answers.find((a) => a.taskId === task.id);
            let ansText = "Нет ответа";
            
            if (ans?.kind === "single-choice") {
              const opt = task.kind === "single-choice" ? task.options.find(o => o.id === ans.optionId) : null;
              ansText = opt ? opt.label : ans.optionId;
            } else if (ans?.kind === "short-text") {
              ansText = ans.text.trim().length > 0 ? ans.text : "Пустой текст";
            }

            return (
              <div key={task.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
                <p><strong>{task.topic}:</strong> {task.prompt}</p>
                <p style={{ marginTop: '8px', color: '#244a7c' }}>Ваш ответ: {ansText}</p>
              </div>
            );
          })}
        </div>
        <button onClick={handleRestart} style={{ marginTop: '20px' }}>Начать новую попытку</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{mainSet.title}</h1>
      <p>Прогресс: {progress.filled} из {progress.total}</p>

      <div className="container">
        <TaskList
          tasks={mainSet.tasks}
          selectedId={currentTask.id}
          onSelect={(taskId) => {
            const index = mainSet.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) setCurrentIndex(index);
          }}
        />

        <div style={{ flex: 2 }}>
          <TaskCard 
            task={currentTask} 
            answer={currentAnswer} 
            onAnswerChange={replaceAnswer} 
          />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              Назад
            </button>

            {currentIndex < mainSet.tasks.length - 1 ? (
              <button onClick={() => setCurrentIndex((i) => Math.min(mainSet.tasks.length - 1, i + 1))}>
                Далее
              </button>
            ) : (
              <button onClick={handleFinish} style={{ background: '#244a7c', color: 'white', borderColor: '#244a7c' }}>
                Завершить попытку
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}