import { useState } from "react";
import type { Answer, TrainingSet } from "./domain";
import { findTaskById, calculateProgress, isAnswerFilled } from "./domain";
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
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedId, setSelectedId] = useState<string>(moduleSet.tasks[0]?.id ?? "");
  const [status, setStatus] = useState<"in-progress" | "submitted">("in-progress");

  const currentTask = findTaskById(moduleSet.tasks, selectedId);
  const progress = calculateProgress(moduleSet, answers);

  const unansweredTasks = moduleSet.tasks.filter((task) => {
    const answer = answers.find((a) => a.taskId === task.id);
    return !answer || !isAnswerFilled(answer, task);
  });

  const handleAnswerChange = (newAnswer: Answer) => {
    setAnswers((prev) => {
      const exists = prev.some((a) => a.taskId === newAnswer.taskId);
      if (exists) {
        return prev.map((a) => (a.taskId === newAnswer.taskId ? newAnswer : a));
      }
      return [...prev, newAnswer];
    });
  };

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
    setStatus("submitted");
  };

  const handleRestart = () => {
    setAnswers([]);
    setSelectedId(moduleSet.tasks[0]?.id ?? "");
    setStatus("in-progress");
  };

  if (status === "submitted") {
    return (
      <main>
        <h1>{moduleSet.title}</h1>
        <h2>Попытка завершена</h2>
        <TaskReview tasks={moduleSet.tasks} answers={answers} />
        <button 
          onClick={handleRestart} 
          className="btn-primary" 
          style={{ marginTop: 20 }}
        >
          Начать новую попытку
        </button>
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
        answers={answers}
        onSelect={setSelectedId}
      />

      {currentTask ? (
        <TaskCard
          task={currentTask}
          answer={answers.find((a) => a.taskId === currentTask.id)}
          onChange={handleAnswerChange}
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
        <button onClick={handleFinish} className="btn-success">
          Завершить
        </button>
      </div>
    </main>
  );
}