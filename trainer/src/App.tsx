import { useState, useEffect } from "react";
import { getSets, getSet } from "./api/trainerApi.js";
import { AttemptScreen } from "./components/AttemptScreen.js";
import type { TrainingSet } from "./domain/domain.js";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; set: TrainingSet };

export default function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const loadTrainingSet = async () => {
    setState({ status: "loading" });
    
    try {
      // 1. Загружаем список наборов
      const sets = await getSets();
      
      if (sets.length === 0) {
        setState({ status: "error", message: "Наборы не найдены" });
        return;
      }
      
      // 2. Берём первый набор
      const firstSet = sets[0];
      
      // 3. Загружаем задания этого набора
      const trainingSet = await getSet(firstSet.id);
      
      setState({ status: "success", set: trainingSet });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить набор";
      setState({ status: "error", message });
    }
  };

  // Загружаем при монтировании
  useEffect(() => {
    loadTrainingSet();
  }, []);

  // Рендеринг в зависимости от состояния
  if (state.status === "loading") {
    return (
      <div style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif", textAlign: "center" }}>
        <p>Загрузка набора...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
        <div style={{ 
          padding: "1.5rem", 
          backgroundColor: "#f8d7da", 
          border: "1px solid #f5c6cb", 
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <p style={{ color: "#721c24", fontSize: "1.1rem", marginBottom: "1rem" }}>
            Ошибка: {state.message}
          </p>
          <button
            onClick={loadTrainingSet}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return <AttemptScreen trainingSet={state.set} />;
}