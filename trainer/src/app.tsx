import { useState } from "react";
import { findTaskById, calculateProgress, Answer, Task, TrainingSet, isAnswerFilled } from "./domain";
//import { sampleSet1 } from "./demo";
import { TaskList } from "./components/taskList";
import { TaskCard } from "./components/taskCard";
import trainingData from "../../course/data/training-set.json"

const sampleSet1 = trainingData as TrainingSet;

export default function App() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    sampleSet1.tasks?.[0]?.id ?? null
  );

  const [answers, setAnswers] = useState<readonly Answer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const currentTask = selectedTaskId ? findTaskById(sampleSet1.tasks, selectedTaskId) : undefined;
  const progress = calculateProgress(sampleSet1, answers);

  const uncompletedTaskIds = sampleSet1.tasks
    .filter(task => {
      const ans = answers.find(a => a.taskId === task.id);
      return !isAnswerFilled(ans);
    })
    .map(task => task.id);

  const handleAnswerChange = (newAnswer: Answer) => {
    if (isSubmitted) return;

    setAnswers((prevAnswers) => {
      const exists = prevAnswers.some((a) => a.taskId === newAnswer.taskId);
      if (exists) {
        return prevAnswers.map((a) => (a.taskId === newAnswer.taskId ? newAnswer : a));
      }
      return [...prevAnswers, newAnswer];
    });
  };

  const handleFinalize = () => {
    if (uncompletedTaskIds.length > 0) {
      const uncompletedTitles = uncompletedTaskIds.map(id => {
        const task = sampleSet1.tasks.find(t => t.id === id);
        return task ? `«${task.topic}»` : id;
      });

      const confirmSubmit = window.confirm(
        `Внимание! У вас остались незаполненные задания по темам: ${uncompletedTitles.join(", ")}.\n\nВы уверены, что хотите завершить попытку?`
      );
      if (!confirmSubmit) return;
    }
    setIsSubmitted(true);
  };

  const handleRestart = () => {
    setAnswers([]);
    setIsSubmitted(false);
    setSelectedTaskId(sampleSet1.tasks[0]?.id || null);
  };

  if (!sampleSet1.tasks || sampleSet1.tasks.length === 0 || !currentTask) {
    return (
      <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>{sampleSet1.title}</h1>
        <p>В модуле нет доступных заданий.</p>
      </main>
    );
  }

  const currentAnswer = answers.find((a) => a.taskId === currentTask.id);

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <h1>{sampleSet1.title} {isSubmitted && <span style={{ color: "green" }}>(Обзор ответов)</span>}</h1>
        <div style={{ margin: "10px 0" }}>
          <label htmlFor="task-progress" style={{ display: "block", marginBottom: "5px" }}>
            Прогресс: заполнено {progress.filled} из {progress.total}
          </label>
          <progress
            id="task-progress"
            value={progress.filled}
            max={progress.total}
            style={{ width: "100%", height: "20px" }}
          />
        </div>

      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "20px" }}>
        <div>
          <TaskList
            tasks={sampleSet1.tasks}
            activeId={selectedTaskId}
            answers={answers}
            onSelect={setSelectedTaskId}
          />

          <div style={{ marginTop: "20px" }}>
            {!isSubmitted ? (
              <button
                type="button"
                onClick={handleFinalize}
                style={{ width: "100%", padding: "10px", backgroundColor: "#ff4d4f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Завершить попытку
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestart}
                style={{ width: "100%", padding: "10px", backgroundColor: "#52c41a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Новая попытка
              </button>
            )}
          </div>
        </div>

        <TaskCard
          task={currentTask}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          isSubmitted={isSubmitted}
        />
      </div>
    </main>
  );
}
