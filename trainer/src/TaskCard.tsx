import type { Task, Answer } from "./domain";

type TaskCardProps = {
  task: Task;
  answer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  onClearAnswer: () => void;
};

export function TaskCard({ task, answer, onAnswerChange, onClearAnswer }: TaskCardProps) {
  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#fff" }}>
      <h3 style={{ color: "#555", fontSize: "14px", textTransform: "uppercase" }}>
        Тема: {task.topic}
      </h3>
      <p style={{ fontSize: "18px", fontWeight: "bold", margin: "10px 0" }}>
        {task.text}
      </p>

      {task.code && (
        <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "4px", overflowX: "auto" }}>
          {task.code}
        </pre>
      )}

      <div style={{ marginTop: "20px" }}>
        {task.kind === "single-choice" ? (
          <fieldset style={{ border: "none", padding: 0 }}>
            <legend style={{ fontWeight: "bold", marginBottom: "10px" }}>Выберите вариант:</legend>
            {task.options.map((option) => (
              <label key={option} style={{ display: "block", margin: "10px 0", cursor: "pointer" }}>
                <input
                  type="radio"
                  name={`task-${task.id}`}
                  value={option}
                  checked={answer?.kind === "single-choice" && answer.optionId === option}
                  onChange={() => {
                    onAnswerChange({
                      taskId: task.id,
                      kind: "single-choice",
                      optionId: option,
                    });
                  }}
                />
                {" "}{option}
              </label>
            ))}
          </fieldset>
        ) : (
          <div>
            <label htmlFor={`textarea-${task.id}`} style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
              Ваш ответ:
            </label>
            <textarea
              id={`textarea-${task.id}`}
              value={answer?.kind === "short-text" ? answer.text : ""}
              onChange={(e) => {
                onAnswerChange({
                  taskId: task.id,
                  kind: "short-text",
                  text: e.target.value,
                });
              }}
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px",
                fontFamily: "inherit",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
        
        {/* Кнопка очистки появляется только если ответ уже есть */}
        {answer && (
          <button 
            onClick={onClearAnswer}
            style={{ 
              marginTop: "15px", 
              padding: "8px 16px", 
              cursor: "pointer", 
              color: "#d32f2f", 
              background: "#fff", 
              border: "1px solid #d32f2f", 
              borderRadius: "4px" 
            }}
          >
            Очистить ответ
          </button>
        )}
      </div>
    </div>
  );
}