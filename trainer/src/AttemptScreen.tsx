import { useState } from "react";
import type { TrainingSet, Answer } from "./domain";
import type { Attempt, Result } from "./model/apiTypes";
import { getProgress } from "./domain";
import { getMissedTasks } from "./attempt"; 
import { saveAnswer, deleteAnswer, submitAttempt, getResult } from "./api/trainerApi";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { AttemptReview } from "./components/AttemptReview";

type AttemptScreenProps = {
  set: TrainingSet;
  attempt: Attempt;
  onAttemptUpdate: (newAttempt: Attempt) => void;
  onResult: (result: Result) => void;
};

export function AttemptScreen({ set, attempt, onAttemptUpdate, onResult }: AttemptScreenProps) {
  const [demoFail, setDemoFail] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  
  // Состояния для HTTP-запросов
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTask = set.tasks[currentIndex];
  if (!currentTask) return <p>Заданий нет.</p>;

  const currentAnswer = attempt.answers.find((a) => a.taskId === currentTask.id);
  const progress = getProgress(set, attempt.answers);

  // Сохранение ответа (PUT)
  const handleAnswerChange = async (answer: Answer) => {
    setIsLoading(true);
    setError(null);
    try {
      //const updatedAttempt = await saveAnswer(attempt.id, answer);

      const headers = demoFail ? { "X-Demo-Fail": "1" } : undefined;
      const updatedAttempt = await saveAnswer(attempt.id, answer, headers);

      onAttemptUpdate(updatedAttempt); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление ответа (DELETE)
  const handleClear = async (taskId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      //const updatedAttempt = await deleteAnswer(attempt.id, taskId);

      const headers = demoFail ? { "X-Demo-Fail": "1" } : undefined;
      const updatedAttempt = await deleteAnswer(attempt.id, taskId, headers);

      onAttemptUpdate(updatedAttempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setIsLoading(false);
    }
  };

  // Завершение попытки (Submit)
  const handleFinish = async () => {
    const missed = getMissedTasks(set, { answers: attempt.answers, currentIndex, status: "in-progress" });
    let message = "Все задания заполнены. Завершить попытку?";
    if (missed.length > 0) {
      const missedNumbers = missed.map((task) => set.tasks.indexOf(task) + 1).join(", ");
      message = `Не заполнены задания: ${missedNumbers}. Всё равно завершить?`;
    }
    if (!window.confirm(message)) return;

    setIsLoading(true);
    setError(null);
    try {
      // 1. Отправляем submit
      //await submitAttempt(attempt.id);

      const headers = demoFail ? { "X-Demo-Fail": "1" } : undefined;
      await submitAttempt(attempt.id, headers);

      // 2. Запрашиваем результат
      const result = await getResult(attempt.id);
      
      // Отдаем результат наверх в App, чтобы он переключил экран
      onResult(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка завершения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h1>{set.title}</h1>
      <p>Заполнено {progress.filled} из {progress.total}</p>

      {/* Блок отображения ошибки */}
      {error && (
        <div style={{ color: "red", padding: "1rem", border: "1px solid red", marginBottom: "1rem" }}>
          <p>Ошибка: {error}</p>
        </div>
      )}

      {showReview ? (
        <>
          <AttemptReview
            set={set}
            answers={attempt.answers}
            onClear={handleClear}
            canEdit={!isLoading}
          />
          <button 
            type="button" 
            onClick={() => setShowReview(false)}
            disabled={isLoading}
          >
            Вернуться к заданию
          </button>
        </>
      ) : (
        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ width: "300px" }}>
            <h3>Задания</h3>
            <TaskList 
              tasks={set.tasks} 
              answers={attempt.answers} 
              currentIndex={currentIndex} 
              onSelect={setCurrentIndex} 
            />
          </div>

          <div style={{ flex: 1 }}>
            
            <label style={{ display: "block", marginBottom: "1rem", color: "red" }}>
              <input 
                type="checkbox" 
                checked={demoFail} 
                onChange={(e) => setDemoFail(e.target.checked)} 
              /> 
              Режим ошибки (X-Demo-Fail)
            </label>

            <div style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? "none" : "auto" }}>
              <TaskCard
                task={currentTask}
                answer={currentAnswer}
                onChange={handleAnswerChange}
                onClear={handleClear}
              />
            </div>
            
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0 || isLoading}
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex(Math.min(set.tasks.length - 1, currentIndex + 1))}
                disabled={currentIndex === set.tasks.length - 1 || isLoading}
              >
                Далее
              </button>
              <button type="button" onClick={handleFinish} disabled={isLoading}>
                {isLoading ? "Загрузка..." : "Завершить"}
              </button>
              <button type="button" onClick={() => setShowReview(true)} disabled={isLoading}>
                Посмотреть обзор
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}