import { useEffect, useReducer, useState } from "react";
import type { Answer, TrainingSet } from "./domain";
import { setAnswer, trySubmit } from "./attemptRules";
import { TaskList } from "./TaskList";
import { mainSet } from "./demo"; // Берем данные из твоего demo.ts

type Draft = {
  version: 1;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: "in-progress" | "submitted";
};

type State = Draft & {
  currentIndex: number;
};

type Action =
  | { type: "answerChanged"; answer: Answer }
  | { type: "moved"; index: number }
  | { type: "restored"; draft: Draft }
  | { type: "reset"; initial: Draft }
  | { type: "submitted" };

const getInitialState = (set: TrainingSet): State => ({
  version: 1,
  setId: set.id,
  taskId: set.tasks[0]?.id ?? "",
  answers: [],
  status: "in-progress",
  currentIndex: 0,
});

function reducer(state: State, action: Action): State {
  if (state.status === "submitted" && action.type === "answerChanged") {
    return state;
  }

  switch (action.type) {
    case "answerChanged":
      return { ...state, answers: setAnswer(state.answers, action.answer) };
    case "moved":
      return { ...state, currentIndex: action.index, taskId: state.taskId };
    case "restored":
      return { ...action.draft, currentIndex: 0 };
    case "reset":
      return { ...action.initial, currentIndex: 0 };
    case "submitted":
      return { ...state, status: "submitted" };
    default:
      return state;
  }
}

function loadDraft(key: string, expectedSetId: string): Draft | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const d = data as Record<string, unknown>;

    if (d.version !== 1 || d.setId !== expectedSetId) return null;
    if (d.status !== "in-progress" && d.status !== "submitted") return null;
    if (!Array.isArray(d.answers)) return null;
    if (typeof d.taskId !== "string") return null;

    const safeAnswers = d.answers.every((a: unknown) => {
      if (typeof a !== "object" || a === null) return false;
      const ans = a as Record<string, unknown>;
      return typeof ans.taskId === "string" &&
             (ans.kind === "short-text" ? typeof ans.text === "string" : ans.kind === "single-choice");
    });

    if (!safeAnswers) return null;
    return d as Draft;
  } catch {
    return null;
  }
}

export function App() { // Именованный экспорт!
  const trainingSet = mainSet;
  
  const [state, dispatch] = useReducer(reducer, getInitialState(trainingSet));
  const [warning, setWarning] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const draft = loadDraft("trainer-draft", trainingSet.id);
    if (draft) {
      dispatch({ type: "restored", draft });
    }
    setIsRestoring(false);
  }, [trainingSet.id]);

  useEffect(() => {
    if (isRestoring) return;

    const draft: Draft = {
      version: 1,
      setId: state.setId,
      taskId: state.taskId,
      answers: state.answers,
      status: state.status,
    };

    try {
      localStorage.setItem("trainer-draft", JSON.stringify(draft));
    } catch {
      setWarning("Не удалось сохранить черновик. Ввод продолжается, но данные не сохранятся.");
    }
  }, [state, isRestoring]);

  const handleAnswerChange = (answer: Answer) => {
    dispatch({ type: "answerChanged", answer });
  };

  const handleReset = () => {
    try {
      localStorage.removeItem("trainer-draft");
    } catch {}
    dispatch({ type: "reset", initial: getInitialState(trainingSet) });
    setWarning(null);
  };

  const handleSubmit = () => {
    const result = trySubmit(trainingSet.tasks, state.answers);
    if (!result.ok) {
      setWarning(`Не заполнены ответы для: ${result.missingIds.join(", ")}`);
      return;
    }
    dispatch({ type: "submitted" });
    setWarning(null);
  };

  if (isRestoring) return <div>Загрузка черновика...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{trainingSet.title}</h1>
      {warning && <div style={{ color: "red", marginBottom: "10px" }}>{warning}</div>}

      <TaskList
        tasks={trainingSet.tasks}
        answers={state.answers}
        disabled={state.status === "submitted"}
        onAnswerChange={handleAnswerChange}
      />

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSubmit} disabled={state.status === "submitted"}>
          Завершить
        </button>
        <button onClick={handleReset} style={{ marginLeft: "10px" }}>
          Сбросить
        </button>
      </div>
      
      {state.status === "submitted" && (
        <p style={{ color: "green", marginTop: "10px" }}>Попытка завершена. Изменение ответов заблокировано.</p>
      )}
    </div>
  );
}