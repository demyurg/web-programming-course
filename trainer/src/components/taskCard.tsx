import { useState, useEffect } from "react";
import { Task, Answer, RequestState } from "../domain";

type TaskCardProps = {
  task: Task;
  confirmedAnswer: Answer | undefined;
  isSubmitted: boolean;
  actionState: RequestState;
  onSaveAnswer: (answer: Answer) => void;
  onClearAnswer: (taskId: string) => void;
};

export function TaskCard({
  task,
  confirmedAnswer,
  isSubmitted,
  actionState,
  onSaveAnswer,
  onClearAnswer,
}: TaskCardProps) {

  const [draftOptionId, setDraftOptionId] = useState<string>("");
  const [draftText, setDraftText] = useState<string>("");

  useEffect(() => {
    if (confirmedAnswer?.kind === "single-choice") {
      setDraftOptionId(confirmedAnswer.optionId);
      setDraftText("");
    } else if (confirmedAnswer?.kind === "short-text") {
      setDraftText(confirmedAnswer.text);
      setDraftOptionId("");
    } else {
      setDraftOptionId("");
      setDraftText("");
    }
  }, [task.id, confirmedAnswer]);

  const isLoading = actionState.status === "loading";

  const handleSaveClick = () => {
    if (task.kind === "single-choice") {
      if (!draftOptionId) return;
      onSaveAnswer({ taskId: task.id, kind: "single-choice", optionId: draftOptionId });
    } else {
      onSaveAnswer({ taskId: task.id, kind: "short-text", text: draftText });
    }
  };

  return (
    <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
      <h2>{task.prompt}</h2>
      <p><strong>Тема:</strong> {task.topic}</p>

      {task.code && (
        <pre style={{ background: "#f5f5f5", padding: "0.5rem", overflowX: "auto" }}>
          <code>{task.code}</code>
        </pre>
      )}

      <div style={{ marginBottom: "10px", fontSize: "0.85rem" }}>
        {confirmedAnswer ? (
          <span style={{ color: "green" }}>Ответ сохранен</span>
        ) : (
          <span style={{ color: "#888" }}>Ответ не сохранён</span>
        )}
      </div>

      {task.kind === "single-choice" ? (
        <fieldset disabled={isSubmitted || isLoading} style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: "0.5rem", fontStyle: "italic" }}>Выберите один из вариантов:</legend>
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {task.options.map((option) => (
              <li key={option.id} style={{ padding: "0.25rem 0" }}>
                <label style={{ cursor: isSubmitted || isLoading ? "not-allowed" : "pointer" }}>
                  <input
                    type="radio"
                    name={`task-${task.id}`}
                    checked={draftOptionId === option.id}
                    onChange={() => setDraftOptionId(option.id)}
                  />{" "}
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor={`text-${task.id}`} style={{ fontStyle: "italic" }}>
            Введите ваш ответ:
          </label>
          <textarea
            id={`text-${task.id}`}
            value={draftText}
            disabled={isSubmitted || isLoading}
            onChange={(event) => setDraftText(event.target.value)}
            placeholder={isSubmitted ? "Ответ не был введен" : "Начните писать здесь..."}
            rows={4}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #aaa" }}
          />
        </div>
      )}

      {!isSubmitted && (
        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button
            type="button"
            disabled={isLoading || (task.kind === "single-choice" && !draftOptionId)}
            onClick={handleSaveClick}
            style={{
              padding: "8px 16px",
              backgroundColor: isLoading ? "#ccc" : "#1890ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Сохранение..." : "Сохранить"}
          </button>

          {confirmedAnswer && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onClearAnswer(task.id)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Очистить
            </button>
          )}
        </div>
      )}
    </section>
  );
}
