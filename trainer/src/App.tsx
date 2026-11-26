import { useEffect, useState } from "react";
import type { TrainingSet } from "./domain";
import type { Attempt, Result } from "./model/apiTypes";
import { getSets, getSet, createAttempt, getAttempt, getResult } from "./api/trainerApi";
import { AttemptScreen } from "./AttemptScreen";
import { ResultScreen } from "./components/ResultScreen";

export default function App() {
  // --- 1. СОСТОЯНИЯ ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [set, setSet] = useState<TrainingSet | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [result, setResult] = useState<Result | null>(null); 

  // --- 2. ЗАГРУЗКА ПРИ СТАРТЕ ---
  // useEffect позволяет делать загрузку первоначальных данных только после монтирования компонента
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const savedId = localStorage.getItem("attemptId");
        
        // Если есть сохраненный ID, пытаемся восстановить
        if (savedId) {
          try {
            const existingAttempt = await getAttempt(savedId);
            const existingSet = await getSet(existingAttempt.setId);
            
            setAttempt(existingAttempt);
            setSet(existingSet);

            // Если попытка уже была завершена, подгружаем результат
            if (existingAttempt.status === "submitted") {
              const existingResult = await getResult(existingAttempt.id);
              setResult(existingResult);
            }
            return; // Выходим, всё загружено
          } catch (e) {
            // Если это 404 (попытка не найдена), идем создавать новую
            if (e instanceof Error && e.message.includes("404")) {
              localStorage.removeItem("attemptId");
            } else {
              throw e; // Пробрасываем сетевую ошибку сразу во внешний catch, не пытаясь создавать новую
            }
          }
        }

        // Если ID нет (или он не сработал), создаем новую попытку
        const sets = await getSets();
        if (sets.length === 0) throw new Error("На сервере нет доступных модулей");
        
        const targetSetId = sets[0].id;
        const loadedSet = await getSet(targetSetId);
        const newAttempt = await createAttempt(targetSetId);
        
        localStorage.setItem("attemptId", newAttempt.id);
        setSet(loadedSet);
        setAttempt(newAttempt);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // --- 3. ОБРАБОТЧИКИ ---
  
  // Сброс попытки (вызывается с экрана результата)
  const handleRestart = () => {
    localStorage.removeItem("attemptId");
    window.location.reload();
  };

  // --- 4. РЕНДЕРИНГ ---

  if (loading) return <p>Загрузка модуля и попытки...</p>;
  
  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Ошибка: {error}</p>
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  if (!set || !attempt) return <p>Данные не загружены</p>;

  // Если есть результат — показываем экран результата
  if (result) {
    return (
      <main style={{ padding: "2rem" }}>
        <ResultScreen result={result} onRestart={handleRestart} />
      </main>
    );
  }

  // Иначе — показываем экран прохождения
  return (
    <main style={{ padding: "2rem" }}>
      <AttemptScreen 
        set={set} 
        attempt={attempt} 
        onAttemptUpdate={setAttempt} 
        onResult={setResult} 
      />
    </main>
  );
}