import { useState, useEffect } from "react";
import type { TrainingSet, Task, Answer } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import * as api from "./api/trainerApi";

export default function App() {
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedId, setSelectedId] = useState("ts-1");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  // При запуске загружаем данные
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        // Загружаем модуль
        const data = await api.fetchTrainingSet("web-basics");
        setTrainingSet(data);
        
        // Создаем попытку
        const attempt = await api.createAttempt("web-basics");
        setAttemptId(attempt.id);
        setSelectedId(data.tasks[0].id);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Сохранение ответа
  async function handleSaveAnswer(newAnswer: Answer) {
    if (!attemptId) return;
    try {
      setError(null);
      // Оптимистичное обновление
      const filtered = answers.filter((a) => a.taskId !== newAnswer.taskId);
      setAnswers([...filtered, newAnswer]);
      
      // Отправка на сервер
      await api.saveAnswer(attemptId, newAnswer);
    } catch (err: any) {
      setError("Не удалось сохранить ответ: " + err.message);
    }
  }

  // Удаление ответа
  async function handleClearAnswer(taskId: string) {
    if (!attemptId) return;
    try {
      setError(null);
      setAnswers(answers.filter((a) => a.taskId !== taskId));
      await api.deleteAnswer(attemptId, taskId);
    } catch (err: any) {
      setError("Не удалось удалить ответ: " + err.message);
    }
  }

  // Завершение
  async function handleFinish() {
    if (!attemptId) return;
    try {
      setError(null);
      setIsLoading(true);
      await api.submitAttempt(attemptId);
      const res = await api.fetchResult(attemptId);
      setResult(res);
      setIsSubmitted(true);
    } catch (err: any) {
      setError("Ошибка при завершении: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading && !trainingSet) return <main><p>Загрузка модуля...</p></main>;
  if (error) return <main><p style={{color: 'red'}}>{error}</p><button onClick={() => window.location.reload()}>Повторить</button></main>;
  if (!trainingSet || !attemptId) return null;

  let selectedTask: Task | undefined = undefined;
  for (const t of trainingSet.tasks) {
    if (t.id === selectedId) { selectedTask = t; break; }
  }
  let currentAnswer: Answer | undefined = undefined;
  for (const a of answers) {
    if (a.taskId === selectedId) { currentAnswer = a; break; }
  }

  // Экран результата (если завершено)
  if (isSubmitted && result) {
    return (
      <main>
        <h1>{trainingSet.title}</h1>
        <h2>Результат</h2>
        <p>Статус: {result.status === 'pending-review' ? 'Ожидает проверки' : 'Оценено'}</p>
        <p>Баллы: {result.score !== null ? result.score : 'Ожидает проверки'} из {result.maxScore}</p>
        
        <div className="review-list">
          {trainingSet.tasks.map((task) => {
            const item = result.items.find((i: any) => i.taskId === task.id);
            return (
              <div key={task.id} className="review-card">
                <p><strong>{task.id}</strong></p>
                <p>Статус: {item ? item.status : 'Нет'}</p>
                <p>Оценка: {item && item.score !== null ? item.score : 'Ожидает'}</p>
              </div>
            );
          })}
        </div>
        <button onClick={() => window.location.reload()} className="btn-finish">
          Начать заново
        </button>
      </main>
    );
  }

  // Экран прохождения
  return (
    <main>
      <h1>{trainingSet.title}</h1>
      
      {error && <p className="missed-warning">Ошибка: {error}</p>}

      <div className="task-layout">
        <TaskList
          tasks={trainingSet.tasks}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <div>
          {selectedTask ? (
            <TaskCard
              task={selectedTask}
              answer={currentAnswer}
              onAnswerChange={handleSaveAnswer}
              onClear={() => handleClearAnswer(selectedTask!.id)}
              disabled={isLoading}
            />
          ) : (
            <p>Задание не найдено.</p>
          )}
          
          <div className="action-buttons">
            <button 
              onClick={handleFinish} 
              className="btn-finish" 
              disabled={isLoading}
            >
              {isLoading ? "Отправка..." : "Завершить попытку"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}