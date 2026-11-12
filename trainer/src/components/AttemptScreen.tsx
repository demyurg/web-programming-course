import { useState, useReducer, useEffect, useRef } from "react";
import type {
  TrainingSet,
  Answer,
  Task,
  Draft,
  AttemptState,
  AttemptAction
} from "../domain/domain.js";
import { getProgress, readDraft } from "../domain/domain.js";
import { TaskCardForm } from "./TaskCardForm.js";

const STORAGE_KEY_PREFIX = "draft-";

function getStorageKey(setId: string): string {
  return `${STORAGE_KEY_PREFIX}${setId}`;
}

// Reducer
function reducer(state: AttemptState, action: AttemptAction): AttemptState {
  switch (action.type) {
    case "answerChanged":
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: [
          ...state.answers.filter((a) => a.taskId !== action.answer.taskId),
          action.answer,
        ]
      };
    
    case "answerRemoved":
      if (state.status === "submitted") return state;
      return {
        ...state,
        answers: state.answers.filter((a) => a.taskId !== action.taskId),
      };

    case "moved":
      return { ...state, currentIndex: action.index };
    case "reset":
      return {
        currentIndex: 0,
        answers: [],
        status: "in-progress",
        storageWarning: undefined
      };
    case "restored":
      return {
        currentIndex: 0,
        answers: action.draft.answers,
        status: action.draft.status,
      };
    case "submitted":
      return { ...state, status: "submitted" };
    default:
      return state;
  }
}

type AttemptScreenProps = {
  trainingSet: TrainingSet;
};

export function AttemptScreen({ trainingSet }: AttemptScreenProps) {
  const tasks = trainingSet.tasks;
  const setId = trainingSet.id;
  const storageKey = getStorageKey(setId);

  const initialState: AttemptState = {
    currentIndex: 0,
    answers: [],
    status: "in-progress",
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [uiWarning, setUiWarning] = useState<string | undefined>(undefined);
  const isInitialMount = useRef(true);
  
  // Состояние переключения между формой и обзором (только для in-progress)
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Эффект чтения
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const draft = readDraft(raw, setId);

    if (draft) {
      dispatch({ type: "restored", draft });
    } else if (raw !== null) {
      setUiWarning("Найден повреждённый или несовместимый черновик. Начните новую попытку.");
    }
    isInitialMount.current = false;
  }, [storageKey, setId]);

  // Эффект записи
  useEffect(() => {
    if (isInitialMount.current && uiWarning) return;

    const draft: Draft = {
      version: 1,
      setId: setId,
      taskId: tasks[state.currentIndex]?.id || "",
      answers: state.answers,
      status: state.status,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      setUiWarning("Не удалось сохранить черновик. Ввод продолжается в памяти.");
    }
  }, [storageKey, setId, state.answers, state.status, state.currentIndex, tasks, uiWarning]);

  // Вспомогательные функции UI
  const getCurrentAnswer = (taskId: string): Answer | undefined =>
    state.answers.find((a) => a.taskId === taskId);

  const isAnswered = (answer: Answer | undefined): boolean => {
    if (!answer) return false;
    if (answer.kind === "single-choice") return answer.optionId.length > 0;
    return answer.text.trim().length > 0;
  };

  const goNext = () => dispatch({ type: "moved", index: Math.min(state.currentIndex + 1, tasks.length - 1) });
  const goPrev = () => dispatch({ type: "moved", index: Math.max(state.currentIndex - 1, 0) });

  const handleFinish = () => {
    const missed = tasks.filter((task) => !isAnswered(getCurrentAnswer(task.id)));
    let message = "Все задания заполнены. Завершить попытку?";
    if (missed.length > 0) {
      const numbers = missed.map(t => tasks.indexOf(t) + 1).join(", ");
      message = `Не заполнены задания №${numbers}. Всё равно завершить?`;
    }
    if (window.confirm(message)) {
      dispatch({ type: "submitted" });
    }
  };

  const handleRestart = () => {
    dispatch({ type: "reset" });
    localStorage.removeItem(storageKey);
    setUiWarning(undefined);
    setIsReviewMode(false);
  };

  const progress = getProgress(trainingSet, state.answers);
  const currentTask = tasks[state.currentIndex];
  const currentAnswer = currentTask ? getCurrentAnswer(currentTask.id) : undefined;

  // Общий блок предупреждения
  const warningBlock = uiWarning ? (
    <div style={{ padding: "1rem", backgroundColor: "#fff3cd", border: "1px solid #ffeeba", borderRadius: "4px", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>⚠️ {uiWarning}</span>
      <button
        onClick={() => {
          dispatch({ type: "reset" });
          localStorage.removeItem(storageKey);
          setUiWarning(undefined);
        }}
        style={{ marginLeft: "1rem", padding: "0.5rem 1rem", cursor: "pointer", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
      >
        Сбросить
      </button>
    </div>
  ) : null;

  // Завершение
  if (state.status === "submitted") {
    return (
      <section style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
        <h1>{trainingSet.title}</h1>
        {warningBlock}
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          Попытка завершена. Выполнено {progress.completed} из {progress.total}.
        </p>
        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
          <h3>Обзор ответов:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => {
              const ans = getCurrentAnswer(task.id);
              let display = "Нет ответа";
              if (task.kind === "single-choice" && ans?.kind === "single-choice") {
                const opt = task.options.find(o => o.id === ans.optionId);
                display = opt ? opt.label : "Неизвестный вариант";
              } else if (ans?.kind === "short-text") {
                display = ans.text || "(пусто)";
              }
              return (
                <li key={task.id} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #f0f0f0" }}>
                  <strong>{task.topic}:</strong> {task.prompt}
                  <br />
                  <em style={{ color: "#666" }}>Ваш ответ: {display}</em>
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={handleRestart} style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}>
          Начать новую попытку
        </button>
      </section>
    );
  }

  // Прохождение
  if (!currentTask) return <p>Заданий нет.</p>;

  // Если включен режим обзора во время прохождения
  if (isReviewMode) {
    return (
      <section style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1>{trainingSet.title}</h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666" }}>
            <span>Режим просмотра</span>
            <span>Прогресс: {progress.completed}/{progress.total}</span>
          </div>
        </header>

        {warningBlock}

        <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
          <h3>Обзор ответов:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => {
              const ans = getCurrentAnswer(task.id);
              let display = "Нет ответа";
              if (task.kind === "single-choice" && ans?.kind === "single-choice") {
                const opt = task.options.find(o => o.id === ans.optionId);
                display = opt ? opt.label : "Неизвестный вариант";
              } else if (ans?.kind === "short-text") {
                display = ans.text || "(пусто)";
              }
              
              return (
                <li key={task.id} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{task.topic}:</strong> {task.prompt}
                    <br />
                    <em style={{ color: "#666" }}>Ваш ответ: {display}</em>
                  </div>
                  
                  {/* Кнопка удаления ответа из обзора */}
                  {ans && (
                    <button
                      onClick={() => dispatch({ type: "answerRemoved", taskId: task.id })}
                      style={{ marginLeft: "1rem", padding: "0.4rem 0.8rem", cursor: "pointer", color: "#d32f2f", backgroundColor: "#fff", border: "1px solid #ffcdd2", borderRadius: "4px" }}
                    >
                      Удалить
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <button 
          onClick={() => setIsReviewMode(false)} 
          style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}
        >
          Вернуться к заданиям
        </button>
      </section>
    );
  }

  // Обычная форма прохождения
  return (
    <section style={{ maxWidth: "800px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>{trainingSet.title}</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666" }}>
          <span>Задание {state.currentIndex + 1} из {tasks.length}</span>
          <span>Прогресс: {progress.completed}/{progress.total}</span>
        </div>
      </header>

      {warningBlock}

      <TaskCardForm
        task={currentTask}
        answer={currentAnswer}
        onChange={(next) => {
          dispatch({ type: "answerChanged", answer: next });
          setUiWarning(undefined);
        }}
      />

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", alignItems: "center" }}>
        <button
          onClick={goPrev}
          disabled={state.currentIndex === 0}
          style={{ padding: "0.75rem 1.5rem", cursor: state.currentIndex === 0 ? "not-allowed" : "pointer" }}
        >
          Назад
        </button>
        
        {/* Кнопка переключения в обзор */}
        <button
          onClick={() => setIsReviewMode(true)}
          style={{ padding: "0.75rem 1.5rem", cursor: "pointer", marginLeft: "auto", backgroundColor: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "4px" }}
        >
          Обзор ответов
        </button>

        {state.currentIndex === tasks.length - 1 ? (
          <button onClick={handleFinish} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Завершить
          </button>
        ) : (
          <button onClick={goNext} style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}>
            Далее
          </button>
        )}
      </div>
    </section>
  );
}