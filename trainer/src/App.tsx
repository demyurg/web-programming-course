import { useState } from "react";
import type { TrainingSet, Task, Answer } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";

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
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Сохранение ответа 
  function saveAnswer(newAnswer: Answer) {
    const newAnswersList: Answer[] = [];
    for (const a of answers) {
      if (a.taskId !== newAnswer.taskId) {
        newAnswersList.push(a);
      }
    }
    newAnswersList.push(newAnswer);
    setAnswers(newAnswersList);
  }

  // Подсчёт прогресса 
  let filledCount = 0;
  const missedTasks: string[] = [];

  for (const task of trainingSet.tasks) {
    let answer: Answer | undefined = undefined;
    for (const a of answers) {
      if (a.taskId === task.id) {
        answer = a;
        break;
      }
    }

    let isFilled = false;
    if (answer) {
      if (answer.kind === "single-choice") {
        isFilled = true;
      } else if (answer.kind === "short-text" && answer.text.trim().length > 0) {
        isFilled = true;
      }
    }

    if (isFilled) {
      filledCount++;
    } else {
      missedTasks.push(task.id);
    }
  }

  // Экран завершения
  function handleFinish() {
    if (missedTasks.length > 0) {
      const warning = "Вы не ответили на: " + missedTasks.join(", ") + ". Завершить?";
      if (!window.confirm(warning)) {
        return;
      }
    }
    setIsSubmitted(true);
  }

  // Новая попытка
  function handleRestart() {
    setAnswers([]);
    setIsSubmitted(false);
    setSelectedId("ts-1");
  }

  // Текст ответа
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
        if (opt.id === answer.optionId) {
          return opt.label;
        }
      }
      return answer.optionId;
    }

    if (answer.kind === "short-text") {
      if (answer.text.trim().length > 0) {
        return answer.text;
      } else {
        return "Пустой текст";
      }
    }

    return "Нет ответа";
  }

  // Экран прохождения
  if (isSubmitted) {
    const reviewItems = [];
    for (const task of trainingSet.tasks) {
      const text = getReviewText(task, answers);
      reviewItems.push(
        <div key={task.id} className="review-card">
          <p><strong>{task.id}</strong></p>
          <p>{task.prompt}</p>
          <p><em>Ваш ответ: {text}</em></p>
        </div>
      );
    }

    return (
      <main>
        <h1>{trainingSet.title}</h1>
        <h2>Попытка завершена</h2>
        <p>Вы ответили на {filledCount} из {trainingSet.tasks.length}.</p>

        <div className="review-list">
          {reviewItems}
        </div>

        <button onClick={handleRestart} className="btn-finish">
          Начать новую попытку
        </button>
      </main>
    );
  }

  // Экран выполнения
  let selectedTask: Task | undefined = undefined;
  for (const t of trainingSet.tasks) {
    if (t.id === selectedId) {
      selectedTask = t;
      break;
    }
  }

  let currentAnswer: Answer | undefined = undefined;
  for (const a of answers) {
    if (a.taskId === selectedId) {
      currentAnswer = a;
      break;
    }
  }

  return (
    <main>
      <h1>{trainingSet.title}</h1>
      <p>Прогресс: {filledCount} из {trainingSet.tasks.length}</p>
      
      {missedTasks.length > 0 && (
        <p className="missed-warning">
          Без ответа: {missedTasks.join(", ")}
        </p>
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
              onAnswerChange={saveAnswer}
              disabled={false}
            />
          ) : (
            <p>Задание не найдено.</p>
          )}
          
          <button onClick={handleFinish} className="btn-finish">
            Завершить попытку
          </button>
        </div>
      </div>
    </main>
  );
}