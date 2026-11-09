import { useState } from "react";
import { mainSet } from "./demo";
import { findTaskById } from "./domain";
import type { Answer } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

export default function App() {
  // 1. Состояния
  const [selectedId, setSelectedId] = useState<string>(mainSet.tasks[0]?.id ?? "");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // 2. Вычисляем текущее задание и текущий ответ на него
  const selectedTask = findTaskById(mainSet, selectedId);
  const currentAnswer = answers.find((a) => a.taskId === selectedId);

  // 3. Обработка ввода ответа (иммутабельное обновление)
  const handleAnswerChange = (newAnswer: Answer) => {
    setAnswers((prev) => {
      const exists = prev.find((a) => a.taskId === newAnswer.taskId);
      if (exists) {
        return prev.map((a) => (a.taskId === newAnswer.taskId ? newAnswer : a));
      }
      return [...prev, newAnswer];
    });
  };

  // 4. Вычисление прогресса (на лету)
  const isAnswerValid = (ans: Answer | undefined) => {
    if (!ans) return false;
    if (ans.kind === "short-text") return ans.text.trim().length > 0;
    return !!ans.optionId;
  };
  
  const answeredCount = mainSet.tasks.filter((t) => 
    isAnswerValid(answers.find((a) => a.taskId === t.id))
  ).length;
  const totalTasks = mainSet.tasks.length;

  // 5. Навигация вперед/назад
  const currentIndex = mainSet.tasks.findIndex((t) => t.id === selectedId);
  const handlePrev = () => {
    if (currentIndex > 0) setSelectedId(mainSet.tasks[currentIndex - 1].id);
  };
  const handleNext = () => {
    if (currentIndex < totalTasks - 1) setSelectedId(mainSet.tasks[currentIndex + 1].id);
  };

  // 6. Завершение попытки с проверкой пропусков
  const handleFinish = () => {
    const missed = mainSet.tasks.filter((t) => 
      !isAnswerValid(answers.find((a) => a.taskId === t.id))
    );
    
    if (missed.length > 0) {
      const confirmMsg = `Вы пропустили задания: ${missed.map(t => t.id).join(", ")}. Завершить попытку?`;
      if (!window.confirm(confirmMsg)) return; // Если отмена — выходим
    }
    setIsSubmitted(true);
  };

  // 7. Старт новой попытки
  const handleRestart = () => {
    setAnswers([]);
    setSelectedId(mainSet.tasks[0].id);
    setIsSubmitted(false);
  };

  return (
    <main className="app">
      <header className="app__header">
        <h1>{mainSet.title}</h1>
        <p className="app__count">
          Прогресс: {answeredCount} из {totalTasks} 
          {isSubmitted && " (Завершено)"}
        </p>
      </header>

      <div className="app__layout">
        <aside className="app__sidebar">
          <TaskList
            tasks={mainSet.tasks}
            selectedId={selectedId}
            answers={answers}
            onSelect={setSelectedId}
          />
        </aside>

        <div className="app__content">
          {/* Если попытка завершена — показываем обзор, иначе карточку */}
          {isSubmitted ? (
            <div className="task-card">
              <h2>Обзор ответов</h2>
              <ul>
                {mainSet.tasks.map(t => {
                  const ans = answers.find(a => a.taskId === t.id);
                  return (
                    <li key={t.id} style={{ marginBottom: "1rem" }}>
                      <strong>{t.id}:</strong> {t.prompt} <br />
                      <span style={{ color: isAnswerValid(ans) ? "green" : "red" }}>
                        {ans?.kind === "single-choice" ? `Выбрано: ${ans.optionId}` : 
                         ans?.kind === "short-text" ? `Текст: ${ans.text || "(пусто)"}` : 
                         "Нет ответа"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={handleRestart} style={{ marginTop: "1rem" }}>
                Начать заново
              </button>
            </div>
          ) : (
            <>
              <TaskCard 
                task={selectedTask} 
                answer={currentAnswer}
                onChange={handleAnswerChange}
                disabled={isSubmitted} // Блокируем поля, если завершено (хотя мы скрываем карточку)
              />
              
              <div className="app__navigation" style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
                <button type="button" onClick={handlePrev} disabled={currentIndex === 0}>
                  Назад
                </button>
                <button type="button" onClick={handleNext} disabled={currentIndex === totalTasks - 1}>
                  Вперед
                </button>
                <button type="button" onClick={handleFinish} style={{ marginLeft: "auto", background: "#4a90e2", color: "white" }}>
                  Завершить
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}