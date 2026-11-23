// src/App.tsx — строки 1–12
import React, { useReducer, useState } from "react";
import { Attempt, Action, Task, TaskKind } from "./types";
import { applyAction, getProgress, getSkippedTaskIds } from "./logic";
import { TaskList } from "./TaskList";
import { Overview } from "./Overview";
import trainingSet from "./data/training-set.json"; // ← вместо "./demo"

// Адаптер: формат JSON-контракта (prompt/label) → наш тип Task (question/text)
const mockTasks: Task[] = trainingSet.tasks.map((t) => ({
  id: t.id,
  kind: t.kind as TaskKind,
  question: t.prompt,
  options: t.options?.map((o) => ({ id: o.id, text: o.label })),
}));

const initialAttempt: Attempt = {
  id: "attempt-1",
  status: "in_progress",
  answers: [],
};

function attemptReducer(state: Attempt, action: Action): Attempt {
  return applyAction(state, action);
}

export default function App() {
  const [attempt, dispatch] = useReducer(attemptReducer, initialAttempt);
  const [currentIdx, setCurrentIdx] = useState(0);

  const progress = getProgress(attempt.answers, mockTasks.length);
  const skippedIds = getSkippedTaskIds(mockTasks, attempt.answers);
  const currentTask = mockTasks[currentIdx];
  const currentAnswer = attempt.answers.find((a) => a.taskId === currentTask.id);

  const handleFinish = () => {
    const confirmSubmit = skippedIds.length > 0
      ? window.confirm("Есть пропущенные задания. Завершить попытку?")
      : true;
    if (confirmSubmit) dispatch({ type: "SUBMIT" });
  };

  const handleStartNew = () => {
    dispatch({ type: "RESET" });
    setCurrentIdx(0);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1>Тренажёр (A4)</h1>

      <div style={{ marginBottom: 20, padding: 15, background: "#f5f5f5", borderRadius: 8 }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Прогресс: {progress}%</h3>
        {skippedIds.length > 0 && attempt.status === "in_progress" && (
          <p style={{ color: "#d32f2f", margin: 0 }}>
            ⚠️ Пропущено: {skippedIds.join(", ")}
          </p>
        )}
      </div>

      {attempt.status === "submitted" ? (
        <div>
          <h2 style={{ color: "#2e7d32" }}>✅ Попытка завершена!</h2>
          <Overview tasks={mockTasks} answers={attempt.answers} dispatch={dispatch} isSubmitted={true} />
          <button onClick={handleStartNew} style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}>
            Новая попытка
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 400px", border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
            <TaskList
              task={currentTask}
              answer={currentAnswer}
              dispatch={dispatch}
              isSubmitted={false}
              onPrev={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIdx((i) => Math.min(mockTasks.length - 1, i + 1))}
              onFinish={handleFinish}
              canGoPrev={currentIdx > 0}
              canGoNext={currentIdx < mockTasks.length - 1}
            />
          </div>
          <div style={{ flex: "1 1 300px", border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Обзор ответов</h3>
            <Overview tasks={mockTasks} answers={attempt.answers} dispatch={dispatch} isSubmitted={false} />
          </div>
        </div>
      )}
    </div>
  );
}