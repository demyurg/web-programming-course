import React from "react";
import { Task, Answer, Action } from "./types";
import { getAnswerForTask } from "./logic"; // ← было из "../types", а нужно из "./logic"

type OverviewProps = {
  tasks: Task[];
  answers: Answer[];
  dispatch: React.Dispatch<Action>;
  isSubmitted: boolean;
};

export function Overview({ tasks, answers, dispatch, isSubmitted }: OverviewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {tasks.map((task) => {
        const answer = getAnswerForTask(answers, task.id);
        const isAnswered = !!answer;

        return (
          <div
            key={task.id}
            style={{
              padding: "12px",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              background: isAnswered ? "#e8f5e9" : "#fff",
              opacity: isSubmitted ? 0.7 : 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <strong>{task.id}</strong>
              <span style={{ fontSize: "0.9em", color: isAnswered ? "#2e7d32" : "#f57c00" }}>
                {isAnswered ? "✅ Заполнено" : "⚠️ Пропущено"}
              </span>
            </div>

            <div style={{ fontSize: "0.9em", color: "#555", minHeight: "20px" }}>
              {task.kind === "single-choice"
                ? answer?.kind === "single-choice"
                  ? `Выбрано: ${task.options?.find(o => o.id === answer.optionId)?.text || "неизвестно"}`
                  : "Нет ответа"
                : answer?.kind === "short-text"
                ? `Текст: "${answer.text.length > 30 ? answer.text.substring(0, 30) + "..." : answer.text}"`
                : "Нет ответа"}
            </div>

            {!isSubmitted && isAnswered && (
              <button
                onClick={() => dispatch({ type: "CLEAR_ANSWER", taskId: task.id })}
                style={{
                  marginTop: "10px", padding: "4px 10px", fontSize: "0.85em",
                  cursor: "pointer", background: "#ffebee", color: "#c62828",
                  border: "1px solid #ef9a9a", borderRadius: "4px",
                }}
              >
                Очистить
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}