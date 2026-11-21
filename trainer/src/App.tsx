import { useReducer } from "react";
import type { TrainingSet, Answer } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { setAnswer, clearAnswer, trySubmit, isAnswerFilled } from "./attemptRules";

const mainSet: TrainingSet = {
  id: "set-1",
  title: "Основы TypeScript и React",
  tasks: [
    {
      id: "ts-1",
      kind: "single-choice",
      topic: "TypeScript",
      text: "Какой тип описывает значение, которое может быть строкой или числом?",
      options: ["string | number", "string & number", "any"],
    },
    {
      id: "react-1",
      kind: "short-text",
      topic: "React",
      text: "Напишите название хука для хранения состояния.",
      code: "const [count, setCount] = useState(0);",
    },
  ],
};

type AttemptStatus = "in-progress" | "submitted";

type AttemptState = {
  answers: Answer[];
  status: AttemptStatus;
  currentIndex: number;
  showReview: boolean;
};

type AttemptAction =
  | { type: "SET_ANSWER"; payload: Answer }
  | { type: "CLEAR_ANSWER"; payload: string }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "JUMP"; payload: number }
  | { type: "TOGGLE_REVIEW" }
  | { type: "SUBMIT" }
  | { type: "RESTART" };

function attemptReducer(state: AttemptState, action: AttemptAction): AttemptState {
  // ЗАЩИТА: Если попытка завершена, игнорируем всё, кроме RESTART
  if (state.status === "submitted" && action.type !== "RESTART") {
    return state;
  }

  switch (action.type) {
    case "SET_ANSWER":
      return { ...state, answers: setAnswer(state.answers, action.payload) };
    case "CLEAR_ANSWER":
      return { ...state, answers: clearAnswer(state.answers, action.payload) };
    case "NEXT":
      return { ...state, currentIndex: Math.min(state.currentIndex + 1, mainSet.tasks.length - 1) };
    case "PREV":
      return { ...state, currentIndex: Math.max(state.currentIndex - 1, 0) };
    case "JUMP":
      return { ...state, currentIndex: Math.max(0, Math.min(action.payload, mainSet.tasks.length - 1)) };
    case "TOGGLE_REVIEW":
      return { ...state, showReview: !state.showReview };
    case "SUBMIT":
      return { ...state, status: "submitted", showReview: false };
    case "RESTART":
      return { answers: [], status: "in-progress", currentIndex: 0, showReview: false };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(attemptReducer, {
    answers: [],
    status: "in-progress",
    currentIndex: 0,
    showReview: false,
  });

  const currentTask = mainSet.tasks[state.currentIndex];
  const totalCount = mainSet.tasks.length;

  const filledCount = mainSet.tasks.filter((task) => {
    const answer = state.answers.find((a) => a.taskId === task.id);
    return isAnswerFilled(answer);
  }).length;

  const handleSubmitClick = () => {
    const result = trySubmit(mainSet.tasks, state.answers);
    if (!result.ok) {
      const ids = result.missingIds.join(", ");
      const confirmed = window.confirm(`Не все задания заполнены. Пропущены: ${ids}. Всё равно завершить?`);
      if (!confirmed) return;
    }
    dispatch({ type: "SUBMIT" });
  };

  // ЭКРАН 1: Попытка завершена
  if (state.status === "submitted") {
    return (
      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
        <h1>{mainSet.title}</h1>
        <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
          <h2>Попытка завершена</h2>
          <p>Ваши ответы:</p>
          <ul style={{ lineHeight: "1.8" }}>
            {mainSet.tasks.map((task) => {
              const answer = state.answers.find((a) => a.taskId === task.id);
              return (
                <li key={task.id}>
                  <strong>{task.topic}:</strong> {task.text}<br />
                  <em>Ответ: </em>
                  {answer
                    ? answer.kind === "single-choice"
                      ? answer.optionId
                      : answer.text || "(пусто)"
                    : "(не отвечено)"}
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => dispatch({ type: "RESTART" })}
            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
          >
            Новая попытка
          </button>
        </section>
      </main>
    );
  }

  // ЭКРАН 2: Экран обзора (ДО завершения)
  if (state.showReview) {
    return (
      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
        <h1>Обзор ответов перед завершением</h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>Прогресс: {filledCount} из {totalCount}</p>
        
        <section style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ccc" }}>
          {mainSet.tasks.map((task) => {
            const answer = state.answers.find((a) => a.taskId === task.id);
            const isFilled = isAnswerFilled(answer);
            
            return (
              <div key={task.id} style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
                <h3>{isFilled ? "✅" : "⚠️"} {task.topic}</h3>
                <p>{task.text}</p>
                <div style={{ background: "#f4f4f4", padding: "10px", borderRadius: "4px", marginBottom: "10px" }}>
                  <strong>Ваш ответ: </strong>
                  {answer
                    ? answer.kind === "single-choice"
                      ? answer.optionId
                      : answer.text || "(пусто)"
                    : "(не отвечено)"}
                </div>
                <button
                  onClick={() => dispatch({ type: "CLEAR_ANSWER", payload: task.id })}
                  style={{ padding: "8px 16px", cursor: "pointer", color: "#d32f2f", background: "#fff", border: "1px solid #d32f2f", borderRadius: "4px" }}
                >
                  Очистить ответ
                </button>
              </div>
            );
          })}
        </section>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => dispatch({ type: "TOGGLE_REVIEW" })} style={{ padding: "10px 20px", cursor: "pointer" }}>
            ← Вернуться к заданиям
          </button>
          <button onClick={handleSubmitClick} style={{ padding: "10px 20px", marginLeft: "auto", cursor: "pointer", background: "#4caf50", color: "white", border: "none" }}>
            Подтвердить и завершить
          </button>
        </div>
      </main>
    );
  }

  // ЭКРАН 3: Обычное прохождение
  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>{mainSet.title}</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>Прогресс: {filledCount} из {totalCount}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
        <aside>
          <h2>Список заданий</h2>
          <TaskList
            tasks={mainSet.tasks}
            currentIndex={state.currentIndex}
            onSelect={(index) => dispatch({ type: "JUMP", payload: index })}
            answers={state.answers}
          />
        </aside>

        <section>
          <h2>Задание {state.currentIndex + 1} из {totalCount}</h2>
          {currentTask && (
            <TaskCard
              task={currentTask}
              answer={state.answers.find((a) => a.taskId === currentTask.id)}
              onAnswerChange={(answer) => dispatch({ type: "SET_ANSWER", payload: answer })}
              onClearAnswer={() => dispatch({ type: "CLEAR_ANSWER", payload: currentTask.id })}
            />
          )}

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => dispatch({ type: "PREV" })}
              disabled={state.currentIndex === 0}
              style={{ padding: "10px 20px", cursor: "pointer" }}
            >
              Назад
            </button>
            <button
              onClick={() => dispatch({ type: "NEXT" })}
              disabled={state.currentIndex === totalCount - 1}
              style={{ padding: "10px 20px", cursor: "pointer" }}
            >
              Далее
            </button>
            <button
              onClick={() => dispatch({ type: "TOGGLE_REVIEW" })}
              style={{ padding: "10px 20px", marginLeft: "auto", cursor: "pointer" }}
            >
              Обзор и завершение
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

