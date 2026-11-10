import { useState, useEffect, useReducer } from "react";
import { mainSet } from "./data";
import { getProgress } from "./domain";
import TaskList from "./TaskList";
import TaskCard from "./TaskCard";
import { attemptReducer, State } from "./attempt";

const STORAGE_KEY = "trainer-draft";

export default function App() {
  const [storageError, setStorageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const initialState: State = {
    version: 1,
    setId: mainSet.id,
    taskId: mainSet.tasks[0]?.id || "",
    answers: [],
    status: "in-progress",
  };

  const [state, dispatch] = useReducer(attemptReducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return;

      const v = JSON.parse(raw);

      if (
        !v || typeof v !== "object" ||
        v.version !== 1 || 
        v.setId !== mainSet.id ||
        !Array.isArray(v.answers) ||
        !["in-progress", "submitted"].includes(v.status)
      ) {
        setStorageError("Черновик повреждён или несовместим. Текущее состояние не изменено.");
        return;
      }

      dispatch({ type: "restored", state: v as State });
    } catch (e) {
      setStorageError("Ошибка чтения из хранилища. Формат повреждён.");
    }
  }, []);

  useEffect(() => {
    if (storageError) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveError(null);
    } catch (e) {
      setSaveError("Запись недоступна. Ваши ответы сохраняются только в текущей вкладке.");
    }
  }, [state, storageError]);

  function handleReset() {
    setStorageError(null);
    setSaveError(null);
    dispatch({ type: "reset", setId: mainSet.id, initialTaskId: mainSet.tasks[0]?.id || "" });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  if (storageError) {
    return (
      <div style={{ padding: '24px', background: '#fee2e2', borderRadius: '8px' }}>
        <h1>Ошибка загрузки</h1>
        <p>{storageError}</p>
        <button onClick={handleReset} style={{ background: '#c0392b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
          Явный сброс (Начать новую попытку)
        </button>
      </div>
    );
  }

  if (mainSet.tasks.length === 0) return <div>В модуле пока нет заданий.</div>;

  const currentIndex = mainSet.tasks.findIndex((t) => t.id === state.taskId);
  const currentTask = mainSet.tasks[currentIndex !== -1 ? currentIndex : 0];
  const currentAnswer = state.answers.find((a) => a.taskId === currentTask.id);
  const progress = getProgress(mainSet, state.answers);

  function handleFinish() {
    const missedTasks = mainSet.tasks.filter((task) => {
      const ans = state.answers.find((a) => a.taskId === task.id);
      if (!ans) return true;
      if (ans.kind === "single-choice") return ans.optionId.trim() === "";
      if (ans.kind === "short-text") return ans.text.trim().length === 0;
      return false;
    });

    if (missedTasks.length > 0) {
      const ids = missedTasks.map((t) => t.id).join(", ");
      if (!window.confirm(`Вы не ответили на задания: ${ids}. Завершить попытку?`)) return;
    }
    dispatch({ type: "submitted" });
  }

  if (state.status === "submitted") {
    return (
      <div>
        <h1>{mainSet.title} — Результаты</h1>
        <p>Заполнено: {progress.filled} из {progress.total}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {mainSet.tasks.map((task) => {
            const ans = state.answers.find((a) => a.taskId === task.id);
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
        <button onClick={handleReset} style={{ marginTop: '20px' }}>Начать новую попытку</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{mainSet.title}</h1>
      <p>Прогресс: {progress.filled} из {progress.total}</p>
      
      {saveError && <p style={{ color: '#d97706', fontWeight: 'bold' }}>⚠️ {saveError}</p>}

      <div className="container">
        <TaskList
          tasks={mainSet.tasks}
          selectedId={currentTask.id}
          onSelect={(taskId) => dispatch({ type: "moved", taskId })}
        />

        <div style={{ flex: 2 }}>
          <TaskCard 
            task={currentTask} 
            answer={currentAnswer} 
            onAnswerChange={(ans) => dispatch({ type: "answerChanged", answer: ans })} 
          />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={() => {
                const prevId = mainSet.tasks[Math.max(0, currentIndex - 1)].id;
                dispatch({ type: "moved", taskId: prevId });
              }}
              disabled={currentIndex === 0}
            >
              Назад
            </button>

            {currentIndex < mainSet.tasks.length - 1 ? (
              <button onClick={() => {
                const nextId = mainSet.tasks[Math.min(mainSet.tasks.length - 1, currentIndex + 1)].id;
                dispatch({ type: "moved", taskId: nextId });
              }}>
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