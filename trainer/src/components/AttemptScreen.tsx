import { useState } from "react";
import type { TrainingSet, Answer, Task } from "../domain/domain.js";
import { getProgress } from "../domain/domain.js";
import { TaskCardForm } from "./TaskCardForm.js";

type AttemptStatus = "in-progress" | "submitted";

type AttemptScreenProps = {
  trainingSet: TrainingSet;
};

export function AttemptScreen({ trainingSet }: AttemptScreenProps) {
  const tasks = trainingSet.tasks;

  // Состояния попыток
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<AttemptStatus>("in-progress");

  // Вспомогательные функции
  const getCurrentAnswer = (taskId: string): Answer | undefined => 
    answers.find((a) => a.taskId === taskId);

  const isAnswered = (answer: Answer | undefined): boolean => {
    if (!answer) return false;
    if (answer.kind === "single-choice") return answer.optionId.length > 0;
    return answer.text.trim().length > 0;
  };

  // Неизменяемое обновление ответа 
  const replaceAnswer = (nextAnswer: Answer) => {
    setAnswers((current) => [
      ...current.filter((a) => a.taskId !== nextAnswer.taskId),
      nextAnswer,
    ]);
  };

  // Безопасная навигация 
  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, tasks.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  // Завершение с проверкой пропусков
  const handleFinish = () => {
    const missed = tasks.filter((task) => !isAnswered(getCurrentAnswer(task.id)));
    
    let message = "Все задания заполнены. Завершить попытку?";
    if (missed.length > 0) {
      const numbers = missed.map(t => tasks.indexOf(t) + 1).join(", ");
      message = `Не заполнены задания №${numbers}. Всё равно завершить?`;
    }

    if (window.confirm(message)) {
      setStatus("submitted");
    }
  };

  // Старт новой попытки 
  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("in-progress");
  };

  // Производные значения 
  const progress = getProgress(trainingSet, answers);
  const currentTask = tasks[currentIndex];
  const currentAnswer = currentTask ? getCurrentAnswer(currentTask.id) : undefined;

  // Завершение (submitted) 
  if (status === "submitted") {
    return (
      <section style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
        <h1>{trainingSet.title}</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          Попытка завершена. Выполнено {progress.completed} из {progress.total}.
        </p>
        
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
          <h3>Обзор ответов:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => {
              const ans = getCurrentAnswer(task.id);
              let display = "Нет ответа";
              
              
              if (task.kind === "single-choice" && ans?.kind === "single-choice") {
                const opt = task.options.find(o => o.id === ans.optionId);
                display = opt ? opt.label : "Неизвестный вариант";
              } else if (ans?.kind === "short-text") {
                display = ans.text || "(пусто)";
              }

              return (
                <li key={task.id} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #f0f0f0" }}>
                  <strong>{task.topic}:</strong> {task.prompt}
                  <br />
                  <em style={{ color: "#666" }}>Ваш ответ: {display}</em>
                </li>
              );
            })}
          </ul>
        </div>

        <button onClick={handleRestart} style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}>
          Начать новую попытку
        </button>
      </section>
    );
  }

  // Прохождение (in-progress)
  if (!currentTask) return <p>Заданий нет.</p>;

  return (
    <section style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>{trainingSet.title}</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666" }}>
          <span>Задание {currentIndex + 1} из {tasks.length}</span>
          <span>Прогресс: {progress.completed}/{progress.total}</span>
        </div>
      </header>

      {/* Контролируемая форма */}
      <TaskCardForm 
        task={currentTask} 
        answer={currentAnswer} 
        onChange={replaceAnswer} 
      />

      {/* Навигация */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", alignItems: "center" }}>
        <button onClick={goPrev} disabled={currentIndex === 0} style={{ padding: "0.75rem 1.5rem", cursor: currentIndex === 0 ? "not-allowed" : "pointer" }}>
          Назад
        </button>
        
        {currentIndex === tasks.length - 1 ? (
          <button onClick={handleFinish} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Завершить
          </button>
        ) : (
          <button onClick={goNext} style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}>
            Далее
          </button>
        )}
      </div>
    </section>
  );
}