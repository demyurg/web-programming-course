import { useReducer, useEffect, useState } from "react";
import type { TrainingSet, Answer } from "./model/domain";
import { attemptReducer, initialState } from "./model/attempt";
import { trainerApi } from "./api/trainerApi";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { AttemptReview } from "./components/AttemptReview";
import { AttemptResult } from "./components/AttemptResult";

export default function App() {
  const [state, dispatch] = useReducer(attemptReducer, initialState);
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);

  // 1. ИНИЦИАЛИЗАЦИЯ (Загрузка модуля и попытки)
  useEffect(() => {
    async function init() {
      try {
        dispatch({ type: "setLoading", loading: true });
        
        // Загружаем модуль с сервера (используем фиксированный ID)
        const setData = await trainerApi.getSet("web-basics");
        setTrainingSet(setData);

        // Проверяем сохраненный attemptId в браузере
        const savedId = localStorage.getItem("trainer_attemptId");

        if (savedId) {
          try {
            const attempt = await trainerApi.getAttempt(savedId);
            const answersObj = attempt.answers.reduce((acc, ans) => ({ ...acc, [ans.taskId]: ans }), {});
            dispatch({ type: "init", attemptId: attempt.id, answers: answersObj, status: attempt.status });
            return;
          } catch (e) {
            localStorage.removeItem("trainer_attemptId");
          }
        }

        // Если нет сохраненного, создаем новую попытку
        const attempt = await trainerApi.createAttempt("web-basics");
        localStorage.setItem("trainer_attemptId", attempt.id);
        dispatch({ type: "init", attemptId: attempt.id, answers: {}, status: "in-progress" });
      } catch (e: any) {
        dispatch({ type: "setError", error: "Ошибка загрузки: " + e.message });
      }
    }
    init();
  }, []);

  // 2. ОБРАБОТЧИКИ (Сохранение и удаление)
  async function handleAnswer(answer: Answer) {
    if (!state.attemptId) return;
    dispatch({ type: "answerChanged", answer }); // Мгновенно обновляем UI
    dispatch({ type: "setLoading", loading: true });
    try {
      await trainerApi.saveAnswer(state.attemptId, answer);
      dispatch({ type: "setLoading", loading: false });
    } catch (e: any) {
      dispatch({ type: "setError", error: "Ошибка сохранения: " + e.message });
    }
  }

  async function handleDelete(taskId: string) {
    if (!state.attemptId) return;
    dispatch({ type: "answerDeleted", taskId });
    dispatch({ type: "setLoading", loading: true });
    try {
      await trainerApi.deleteAnswer(state.attemptId, taskId);
      dispatch({ type: "setLoading", loading: false });
    } catch (e: any) {
      dispatch({ type: "setError", error: "Ошибка удаления: " + e.message });
    }
  }

  async function handleSubmit() {
    if (!state.attemptId) return;
    dispatch({ type: "setLoading", loading: true });
    try {
      const result = await trainerApi.submitAttempt(state.attemptId);
      dispatch({ type: "submitted", result });
    } catch (e: any) {
      dispatch({ type: "setError", error: "Ошибка отправки: " + e.message });
    }
  }

  // 3. РЕНДЕР ЭКРАНОВ
  if (state.loading && !trainingSet) return <p>Загрузка модуля...</p>;
  if (state.error && !trainingSet) return <p style={{ color: "red" }}>{state.error}</p>;
  if (!trainingSet) return null;

  if (state.view === "result" && state.result) {
    return (
      <AttemptResult 
        trainingSet={trainingSet} 
        result={state.result} 
        onRestart={() => {
            localStorage.removeItem("trainer_attemptId");
            window.location.reload();
        }} 
      />
    );
  }

  if (state.view === "overview") {
    return (
      <AttemptReview
        trainingSet={trainingSet}
        state={state}
        onBack={() => dispatch({ type: "viewChanged", view: "task" })}
        onDelete={handleDelete}
        onFinish={handleSubmit}
      />
    );
  }

  const currentTask = trainingSet.tasks[state.currentIndex];

  return (
    <div>
      <h1>{trainingSet.title}</h1>
      
      {state.error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", marginBottom: "15px" }}>
          {state.error}
          <button onClick={() => dispatch({ type: "setError", error: null })} style={{ marginLeft: "10px" }}>Скрыть</button>
        </div>
      )}
      
      {state.loading && <p style={{ color: "blue" }}>Синхронизация с сервером...</p>}
      
      <p>Заполнено: {Object.keys(state.answers).length} / {trainingSet.tasks.length}</p>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ width: "200px" }}>
          <TaskList 
            tasks={trainingSet.tasks} 
            currentIndex={state.currentIndex} 
            answers={state.answers} 
            onSelect={(i) => dispatch({ type: "moved", index: i })} 
          />
        </div>

        <div style={{ flex: 1 }}>
          <TaskCard
            task={currentTask}
            answer={state.answers[currentTask.id]}
            onChange={handleAnswer}
            onDelete={() => handleDelete(currentTask.id)}
          />
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button 
              className="btn-secondary" 
              onClick={() => dispatch({ type: "moved", index: state.currentIndex - 1 })} 
              disabled={state.currentIndex === 0}
            >
              Назад
            </button>
            {state.currentIndex < trainingSet.tasks.length - 1 ? (
              <button onClick={() => dispatch({ type: "moved", index: state.currentIndex + 1 })}>Далее</button>
            ) : (
              <button onClick={() => dispatch({ type: "viewChanged", view: "overview" })}>К обзору</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}