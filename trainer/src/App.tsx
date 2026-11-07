import { useReducer, useState } from "react";
import type { TrainingSet } from "./domain";
import { findTaskById, calculateProgress } from "./domain";
import { attemptReducer, getUnansweredTasks } from "./attempt";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { TaskReview } from "./components/TaskReview";

const moduleSet: TrainingSet = {
  id: "web-basics",
  title: "Основы веб-программирования",
  tasks: [
    {
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
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "react",
      prompt: "Объясните, чем props компонента отличаются от его состояния.",
    },
    {
      id: "react-2",
      kind: "single-choice",
      topic: "react",
      prompt: "Почему в списке элементов рекомендуется использовать стабильный key, а не индекс массива?",
      options: [
        { id: "a", label: "Потому что индекс запрещён в React" },
        { id: "b", label: "Потому что при вставке или удалении элемента индекс меняется и React может перепутать строки" },
        { id: "c", label: "Потому что индекс работает только в классовых компонентах" },
        { id: "d", label: "Потому что index замедляет рендер в 10 раз" },
      ],
    },
    {
      id: "html-1",
      kind: "short-text",
      topic: "html",
      prompt: "Зачем нужен <form> в HTML?",
    },
  ],
};

export default function App() {
  const [attempt, dispatch] = useReducer(attemptReducer, {
    status: "in-progress",
    answers: [],
  });
  
  const [selectedId, setSelectedId] = useState<string>(moduleSet.tasks[0]?.id ?? "");
  const [showReview, setShowReview] = useState(false);

  const currentTask = findTaskById(moduleSet.tasks, selectedId);
  const progress = calculateProgress(moduleSet, attempt.answers);
  const unansweredTasks = getUnansweredTasks(moduleSet.tasks, attempt.answers);

  const currentIndex = moduleSet.tasks.findIndex((t) => t.id === selectedId);
  
  const handleBack = () => {
    if (currentIndex > 0) setSelectedId(moduleSet.tasks[currentIndex - 1].id);
  };
  
  const handleNext = () => {
    if (currentIndex < moduleSet.tasks.length - 1) setSelectedId(moduleSet.tasks[currentIndex + 1].id);
  };

  const handleFinish = () => {
    if (unansweredTasks.length > 0) {
      const confirmed = window.confirm(
        `Есть незаполненные задания: ${unansweredTasks.map((t) => t.id).join(", ")}. Завершить?`
      );
      if (!confirmed) return;
    }
    dispatch({ type: "SUBMIT" });
    setShowReview(false);
  };

  const handleRestart = () => {
    dispatch({ type: "RESTART" });
    setSelectedId(moduleSet.tasks[0]?.id ?? "");
    setShowReview(false);
  };

  if (attempt.status === "submitted") {
    return (
      <main>
        <h1>{moduleSet.title}</h1>
        <h2>Попытка завершена</h2>
        <TaskReview 
          tasks={moduleSet.tasks} 
          answers={attempt.answers} 
        />
        <button onClick={handleRestart} className="btn-primary" style={{ marginTop: 20 }}>
          Начать новую попытку
        </button>
      </main>
    );
  }

  if (showReview) {
    return (
      <main>
        <h1>{moduleSet.title}</h1>
        <h2>Обзор ответов (до завершения)</h2>
        <TaskReview 
          tasks={moduleSet.tasks} 
          answers={attempt.answers} 
          onClear={(taskId) => dispatch({ type: "CLEAR_ANSWER", taskId })}
          onSelectTask={(taskId) => {
            setSelectedId(taskId);
            setShowReview(false);
          }}
        />
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button onClick={() => setShowReview(false)} className="btn-secondary">
            Вернуться к заданиям
          </button>
          <button onClick={handleFinish} className="btn-success">
            Завершить
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>{moduleSet.title}</h1>
      
      <div className="progress-container">
        <div className="progress-text">
          Заполнено: {progress.filled} из {progress.total}
        </div>
        <progress value={progress.filled} max={progress.total} />
      </div>

      <TaskList
        tasks={moduleSet.tasks}
        selectedId={selectedId}
        answers={attempt.answers}
        onSelect={setSelectedId}
      />

      {currentTask ? (
        <TaskCard
          task={currentTask}
          answer={attempt.answers.find((a) => a.taskId === currentTask.id)}
          onChange={(answer) => dispatch({ type: "CHANGE_ANSWER", answer })}
        />
      ) : (
        <p>Задание не найдено.</p>
      )}

      <div className="controls">
        <button onClick={handleBack} disabled={currentIndex === 0} className="btn-secondary">
          Назад
        </button>
        <button onClick={handleNext} disabled={currentIndex === moduleSet.tasks.length - 1} className="btn-secondary">
          Далее
        </button>
        
        <button 
          onClick={() => dispatch({ type: "CLEAR_ANSWER", taskId: selectedId })} 
          className="btn-secondary"
          style={{ marginLeft: 'auto' }}
        >
          Очистить
        </button>

        <button onClick={() => setShowReview(true)} className="btn-secondary">
          Обзор
        </button>

        <button onClick={handleFinish} className="btn-success">
          Завершить
        </button>
      </div>
    </main>
  );
}