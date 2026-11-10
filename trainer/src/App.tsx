import { useReducer } from "react";
import type { TrainingSet } from "./domain";
import { getProgress } from "./domain";
import { attemptReducer, initialState, isAnswered } from "./attempt";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { Overview } from "./components/Overview";

import trainingSetData from "../../course/data/training-set.json";
const mainSet = trainingSetData as TrainingSet;

export default function App() {
  const [state, dispatch] = useReducer(attemptReducer, initialState);

  const tasks = mainSet.tasks;
  const currentTask = tasks[state.currentIndex];
  const progress = getProgress(mainSet, Object.values(state.answers));

  // Список пропущенных
  const missedTasks = tasks
    .map((t, i) => (!isAnswered(t, state.answers[t.id]) ? i + 1 : null))
    .filter((n): n is number => n !== null);

  function handleFinish() {
    if (missedTasks.length > 0) {
      if (window.confirm(`Вы не ответили на задания: ${missedTasks.join(", ")}. Завершить?`)) {
        dispatch({ type: "submitted" });
      }
    } else {
      dispatch({ type: "submitted" });
    }
  }

  // Если режим обзора — рендерим Overview
  if (state.view === "overview") {
    return (
      <Overview
        trainingSet={mainSet}
        state={state}
        onRestart={() => dispatch({ type: "reset" })}
        onBackToTasks={() => dispatch({ type: "viewChanged", view: "task" })}
        onDeleteAnswer={(taskId) => dispatch({ type: "answerDeleted", taskId })}
        onFinish={handleFinish}
      />
    );
  }

  // Режим прохождения (task)
  return (
    <div>
      <h1>{mainSet.title}</h1>
      <p><strong>Заполнено:</strong> {progress.filled} / {progress.total}</p>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <TaskList
            tasks={tasks}
            currentIndex={state.currentIndex}
            answers={state.answers}
            onSelect={(index) => dispatch({ type: "moved", index })}
          />
        </div>

        <div style={{ flex: "3 1 400px" }}>
          <TaskCard
            task={currentTask}
            answer={state.answers[currentTask.id]}
            onChange={(answer) => dispatch({ type: "answerChanged", answer })}
            onDelete={() => dispatch({ type: "answerDeleted", taskId: currentTask.id })}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              className="btn-secondary"
              onClick={() => dispatch({ type: "moved", index: state.currentIndex - 1 })}
              disabled={state.currentIndex === 0}
            >
              Назад
            </button>
            {state.currentIndex < tasks.length - 1 ? (
              <button onClick={() => dispatch({ type: "moved", index: state.currentIndex + 1 })}>Далее</button>
            ) : (
              <button onClick={() => dispatch({ type: "viewChanged", view: "overview" })}>К обзору</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}