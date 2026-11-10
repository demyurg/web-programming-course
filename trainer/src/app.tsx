import { useState } from "react";
import { 
  findTaskById, 
  calculateProgress, 
  isAnswerFilled, 
  updateTaskAnswer, 
  clearTaskAnswer, 
  submitAttempt,
  AttemptState, 
  TrainingSet 
} from "./domain";
import { TaskList } from "./components/taskList";
import { TaskCard } from "./components/taskCard";
import trainingData from "../../course/data/training-set.json";

const sampleSet1 = trainingData as TrainingSet;

export default function App() {
  // Владелец общего состояния попытки
  const [attempt, setAttempt] = useState<AttemptState>({
    answers: [],
    isSubmitted: false
  });

  // Деталь интерфейса (местное состояние по гайду): выбранный ID таски или режим 'overview'
  const [viewMode, setViewMode] = useState<string | 'overview'>(
    sampleSet1.tasks?.[0]?.id || 'overview'
  );

  // Производные значения вычисляются на лету из единого источника правды
  const currentTask = viewMode !== 'overview' ? findTaskById(sampleSet1.tasks, viewMode) : undefined;
  const progress = calculateProgress(sampleSet1, attempt.answers);

  const uncompletedTaskIds = sampleSet1.tasks
    .filter(task => {
      const ans = attempt.answers.find(a => a.taskId === task.id);
      return !isAnswerFilled(ans);
    })
    .map(task => task.id);

  // --- Путь действия: Интерфейс принимает ввод и передает общему правилу ---
  
  const handleAnswerChange = (newAnswer: any) => {
    const result = updateTaskAnswer(attempt, newAnswer);
    if (result.ok) setAttempt(result.state); // Если правило разрешило — обновляем отображение
  };

  const handleClearAnswer = (taskId: string) => {
    const result = clearTaskAnswer(attempt, taskId);
    if (result.ok) setAttempt(result.state); // Меняет одну попытку из любого места UI
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
      if (!confirmSubmit) return; // Отмена сохраняет ответы и редактирование
    }
    
    setAttempt(submitAttempt(attempt)); // Правило переводит состояние в submitted
    setViewMode('overview'); // После завершения переключаем в обзор результатов
  };

  const handleRestart = () => {
    setAttempt({ answers: [], isSubmitted: false });
    setViewMode(sampleSet1.tasks?.[0]?.id || 'overview');
  };

  if (!sampleSet1.tasks || sampleSet1.tasks.length === 0) {
    return <main style={{ padding: "20px" }}><h1>{sampleSet1.title}</h1><p>В модуле нет заданий.</p></main>;
  }

  const currentAnswer = currentTask ? attempt.answers.find((a) => a.taskId === currentTask.id) : undefined;

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <h1>{sampleSet1.title} {attempt.isSubmitted && <span style={{ color: "green" }}>(Результат)</span>}</h1>
        <div style={{ margin: "10px 0" }}>
          <label htmlFor="task-progress" style={{ display: "block", marginBottom: "5px" }}>
            Прогресс: заполнено {progress.filled} из {progress.total}
          </label>
          <progress id="task-progress" value={progress.filled} max={progress.total} style={{ width: "100%", height: "20px" }} />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "20px" }}>
        <div>
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            style={{
              width: "100%", padding: "0.5rem", marginBottom: "10px", textAlign: "left", cursor: "pointer",
              backgroundColor: viewMode === 'overview' ? '#d0d0d0' : '#f0f0f0', fontWeight: viewMode === 'overview' ? 'bold' : 'normal',
              border: "1px solid #aaa", borderRadius: "4px"
            }}
          >
            Общий обзор ответов
          </button>

          <TaskList
            tasks={sampleSet1.tasks}
            activeId={viewMode === 'overview' ? null : viewMode}
            answers={attempt.answers}
            onSelect={setViewMode}
          />

          <div style={{ marginTop: "20px" }}>
            {!attempt.isSubmitted ? (
              <button type="button" onClick={handleFinalize} style={{ width: "100%", padding: "10px", backgroundColor: "#ff4d4f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                Завершить попытку
              </button>
            ) : (
              <button type="button" onClick={handleRestart} style={{ width: "100%", padding: "10px", backgroundColor: "#52c41a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                Новая попытка
              </button>
            )}
          </div>
        </div>

        {viewMode === 'overview' ? (
          <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
            <h3>Состояние ответов всей попытки:</h3>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {sampleSet1.tasks.map(t => {
                const ans = attempt.answers.find(a => a.taskId === t.id);
                return (
                  <li key={t.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{t.topic}:</strong> {ans ? (ans.kind === 'single-choice' ? `Выбран вариант ID: ${ans.optionId}` : ans.text) : <em>Нет ответа</em>}
                    </div>
                    {ans && !attempt.isSubmitted && (
                      <button 
                        type="button" 
                        onClick={() => handleClearAnswer(t.id)} 
                        style={{ color: "red", border: "1px solid red", background: "none", padding: "3px 8px", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Удалить
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          currentTask && (
            <div>
              <TaskCard
                task={currentTask}
                currentAnswer={currentAnswer}
                onAnswerChange={handleAnswerChange}
                isSubmitted={attempt.isSubmitted}
              />
              {currentAnswer && !attempt.isSubmitted && (
                <button
                  type="button"
                  onClick={() => handleClearAnswer(currentTask.id)}
                  style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#dfdfdf", border: "1px solid #999", borderRadius: "4px", cursor: "pointer" }}
                >
                  Очистить ответ 
                </button>
              )}
            </div>
          )
        )}
      </div>
    </main>
  );
}
