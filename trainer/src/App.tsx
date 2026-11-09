import { useState, useReducer } from "react";
import type { TrainingSet, Task, Answer } from "./domain";
import { getProgress } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { attemptReducer } from "./attempt";

// Данные
const task1: Task = {
  id: "ts-1",
  kind: "single-choice",
  topic: "typescript",
  prompt: "Что выведет этот JavaScript-код?",
  code: 'console.log("10" * 5);',
  options: [
    { id: "a", label: "105" },
    { id: "b", label: "50" },
    { id: "c", label: "Ошибка" },
  ],
};

const task2: Task = {
  id: "react-1",
  kind: "short-text",
  topic: "react",
  prompt: "Объясните, чем props компонента отличаются от его состояния.",
};

const trainingSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [task1, task2],
};

export default function App() {
  const [selectedId, setSelectedId] = useState("ts-1");
  
  // useReducer для ответов и статуса
  const [attempt, dispatch] = useReducer(attemptReducer, {
    answers: [],
    isSubmitted: false,
  });

  // Локальное состояние для открытия обзора до завершения
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Подсчёт прогресса через функцию из domain.ts
  const progress = getProgress(trainingSet, attempt.answers);
  const filledCount = progress.filled;

  // Список пропущенных
  const missedTasks: string[] = [];
  for (const task of trainingSet.tasks) {
    let isFilled = false;
    for (const a of attempt.answers) {
      if (a.taskId === task.id) {
        if (a.kind === "single-choice") isFilled = true;
        else if (a.kind === "short-text" && a.text.trim().length > 0) isFilled = true;
      }
    }
    if (!isFilled) missedTasks.push(task.id);
  }

  function handleFinish() {
    if (missedTasks.length > 0) {
      const warning = "Вы не ответили на: " + missedTasks.join(", ") + ". Завершить?";
      if (!window.confirm(warning)) return;
    }
    dispatch({ type: "submit" });
    setIsReviewMode(true); // Финальный экран
  }

  function handleRestart() {
    dispatch({ type: "restart" });
    setSelectedId("ts-1");
    setIsReviewMode(false);
  }

  function getReviewText(task: Task, answersList: Answer[]): string {
    let answer: Answer | undefined = undefined;
    for (const a of answersList) {
      if (a.taskId === task.id) {
        answer = a;
        break;
      }
    }
    if (!answer) return "Нет ответа";

    if (answer.kind === "single-choice" && task.kind === "single-choice") {
      for (const opt of task.options) {
        if (opt.id === answer.optionId) return opt.label;
      }
      return answer.optionId;
    }
    if (answer.kind === "short-text") {
      return answer.text.trim().length > 0 ? answer.text : "Пустой текст";
    }
    return "Нет ответа";
  }

  // Экран обзора (до завершения или после)
  if (isReviewMode || attempt.isSubmitted) {
    const reviewItems = [];
    for (const task of trainingSet.tasks) {
      const text = getReviewText(task, attempt.answers);
      reviewItems.push(
        <div key={task.id} className="review-card">
          <p><strong>{task.id}</strong>: {task.prompt}</p>
          <p><em>Ваш ответ: {text}</em></p>
          
          {/* Кнопка очистки в обзоре (до завершения) */}
          {!attempt.isSubmitted && (
            <button 
              onClick={() => dispatch({ type: "clear", taskId: task.id })}
              className="btn-clear"
            >
              Удалить ответ
            </button>
          )}
        </div>
      );
    }

    return (
      <main>
        <h1>{trainingSet.title}</h1>
        <h2>{attempt.isSubmitted ? "Попытка завершена" : "Предварительный обзор"}</h2>
        <p>Вы ответили на {filledCount} из {trainingSet.tasks.length}.</p>

        <div className="review-list">{reviewItems}</div>

        {!attempt.isSubmitted ? (
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => setIsReviewMode(false)} className="btn-finish" style={{ marginRight: "10px", background: "gray" }}>
              Вернуться к заданиям
            </button>
            <button onClick={handleFinish} className="btn-finish">
              Завершить попытку
            </button>
          </div>
        ) : (
          <button onClick={handleRestart} className="btn-finish">
            Начать новую попытку
          </button>
        )}
      </main>
    );
  }

  // Экран прохождения
  let selectedTask: Task | undefined = undefined;
  for (const t of trainingSet.tasks) {
    if (t.id === selectedId) { selectedTask = t; break; }
  }

  let currentAnswer: Answer | undefined = undefined;
  for (const a of attempt.answers) {
    if (a.taskId === selectedId) { currentAnswer = a; break; }
  }

  return (
    <main>
      <h1>{trainingSet.title}</h1>
      <p>Прогресс: {filledCount} из {trainingSet.tasks.length}</p>
      
      {missedTasks.length > 0 && (
        <p className="missed-warning">Без ответа: {missedTasks.join(", ")}</p>
      )}

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
              onAnswerChange={(ans) => dispatch({ type: "save", answer: ans })}
              onClear={() => dispatch({ type: "clear", taskId: selectedTask!.id })}
              disabled={false}
            />
          ) : (
            <p>Задание не найдено.</p>
          )}
          
          <div className="action-buttons">
            <button onClick={() => setIsReviewMode(true)} className="btn-secondary">
              Обзор ответов
            </button>
            <button onClick={handleFinish} className="btn-finish" style={{ marginTop: 0 }}>
              Завершить попытку
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}