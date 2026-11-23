import React from "react";
import { Task, Answer, Action } from "./types"; // ← было "../types", нужно "./types"

type TaskCardProps = {
  task: Task;
  answer?: Answer;
  dispatch: React.Dispatch<Action>;
  isSubmitted: boolean;
};

export function TaskCard({ task, answer, dispatch, isSubmitted }: TaskCardProps) {
  const handleSetAnswer = (answerData: Answer) => {
    dispatch({ type: "SET_ANSWER", answer: answerData });
  };

  const handleClear = () => {
    dispatch({ type: "CLEAR_ANSWER", taskId: task.id });
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Задание: {task.id}</h3>
      <p style={{ fontSize: "1.1em", marginBottom: "15px" }}>{task.question}</p>

      {task.kind === "single-choice" && task.options && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {task.options.map((opt) => (
            <label
              key={opt.id}
              style={{ opacity: isSubmitted ? 0.6 : 1, cursor: isSubmitted ? "default" : "pointer" }}
            >
              <input
                type="radio"
                name={`task-${task.id}`}
                value={opt.id}
                checked={answer?.kind === "single-choice" && answer.optionId === opt.id}
                onChange={() => handleSetAnswer({ taskId: task.id, kind: "single-choice", optionId: opt.id })}
                disabled={isSubmitted}
                style={{ marginRight: "8px" }}
              />
              {opt.text}
            </label>
          ))}
        </div>
      )}

      {task.kind === "short-text" && (
        <textarea
          value={answer?.kind === "short-text" ? answer.text : ""}
          onChange={(e) => handleSetAnswer({ taskId: task.id, kind: "short-text", text: e.target.value })}
          disabled={isSubmitted}
          style={{
            width: "100%", minHeight: "80px", padding: "8px", fontSize: "14px",
            opacity: isSubmitted ? 0.6 : 1,
          }}
        />
      )}

      {!isSubmitted && (
        <button
          onClick={handleClear}
          disabled={!answer}
          style={{
            marginTop: "15px", padding: "6px 12px",
            cursor: answer ? "pointer" : "not-allowed",
            background: "#f44336", color: "white", border: "none", borderRadius: "4px",
          }}
        >
          Очистить ответ
        </button>
      )}
    </div>
  );
}