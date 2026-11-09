import { useState } from "react";
import type { TrainingSet, Answer } from "./domain";
import trainingSetData from "./data/training-set.json";
import { TaskList } from "./TaskList";

const SET: TrainingSet = trainingSetData as TrainingSet;

// --- Вспомогательные функции для вычисления производных значений ---
function getProgress(set: TrainingSet, answers: Answer[]) {
  const total = set.tasks.length;
  const filled = set.tasks.filter((task) => {
    const ans = answers.find((a) => a.taskId === task.id);
    if (!ans) return false;
    if (ans.kind === "short-text") return ans.text.trim().length > 0;
    return true; // single-choice считается заполненным
  }).length;
  return { filled, total };
}

function getSkippedIds(set: TrainingSet, answers: Answer[]): string[] {
  return set.tasks
    .filter((task) => {
      const ans = answers.find((a) => a.taskId === task.id);
      if (!ans) return true;
      if (ans.kind === "short-text") return ans.text.trim().length === 0;
      return false;
    })
    .map((task) => task.id);
}

export function App() {
  // Состояние попытки (живёт здесь, не стирается при переходах)
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"in-progress" | "submitted">("in-progress");
  const [showWarning, setShowWarning] = useState(false);

  const isSubmitted = status === "submitted";
  const progress = getProgress(SET, answers);
  const skippedIds = getSkippedIds(SET, answers);

  // Неизменяемое обновление ответа
  const handleAnswerChange = (newAnswer: Answer) => {
    if (isSubmitted) return; // Блокировка изменений после завершения
    const filtered = answers.filter((a) => a.taskId !== newAnswer.taskId);
    setAnswers([...filtered, newAnswer]);
  };

  const handleNext = () => {
    if (currentIndex < SET.tasks.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleFinishClick = () => {
    if (skippedIds.length > 0) {
      setShowWarning(true);
    } else {
      setStatus("submitted");
    }
  };

  const handleConfirmFinish = () => {
    setShowWarning(false);
    setStatus("submitted");
  };

  const handleCancelFinish = () => {
    setShowWarning(false); // Отмена НЕ меняет ответы и НЕ закрывает попытку
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("in-progress");
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>{SET.title}</h1>
      
      {/* Прогресс-бар */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Прогресс</span>
          <span>{progress.filled} из {progress.total}</span>
        </div>
        <progress value={progress.filled} max={progress.total} style={{ width: "100%" }} />
      </div>

      {isSubmitted ? (
        // Экран обзора после завершения
        <div>
          <h2>Попытка завершена</h2>
          <p>Статус: <strong>submitted</strong> (редактирование заблокировано)</p>
          <ul>
            {SET.tasks.map((task) => {
              const ans = answers.find((a) => a.taskId === task.id);
              return (
                <li key={task.id} style={{ marginBottom: 8 }}>
                  <strong>{task.id}</strong>:{" "}
                  {ans
                    ? ans.kind === "short-text"
                      ? ans.text || "(пусто)"
                      : `вариант ${ans.optionId}`
                    : "не отвечено"}
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={handleRestart} style={{ marginTop: 16, padding: "8px 16px" }}>
            Начать новую попытку
          </button>
        </div>
      ) : (
        <TaskList
          task={SET.tasks[currentIndex]}
          answer={answers.find((a) => a.taskId === SET.tasks[currentIndex].id)}
          onAnswerChange={handleAnswerChange}
          onPrev={handlePrev}
          onNext={handleNext}
          onFinish={handleFinishClick}
          canGoPrev={currentIndex > 0}
          canGoNext={currentIndex < SET.tasks.length - 1}
        />
      )}

      {/* Модальное окно предупреждения */}
      {showWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", color: "black", padding: 24, borderRadius: 8, maxWidth: 400 }}>
            <h3 style={{ marginTop: 0 }}>Не все задания заполнены</h3>
            <p>Пропущены: {skippedIds.join(", ")}</p>
            <p>Завершить попытку всё равно?</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button type="button" onClick={handleCancelFinish}>Отмена</button>
              <button type="button" onClick={handleConfirmFinish}>Завершить</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}