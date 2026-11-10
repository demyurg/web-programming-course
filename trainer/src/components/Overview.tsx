import type { TrainingSet } from "../domain";
import type { State } from "../attempt";

type Props = {
  trainingSet: TrainingSet;
  state: State;
  onRestart: () => void;
  onBackToTasks: () => void;
  onDeleteAnswer: (taskId: string) => void;
  onFinish: () => void;
};

export function Overview({ trainingSet, state, onRestart, onBackToTasks, onDeleteAnswer, onFinish }: Props) {
  const isSubmitted = state.status === "submitted";

  return (
    <div>
      <h1>{isSubmitted ? "Попытка завершена" : "Обзор ответов"}</h1>
      <h2>{trainingSet.title}</h2>

      <div style={{ marginTop: "20px" }}>
        {trainingSet.tasks.map((task, index) => {
          const answer = state.answers[task.id];
          let content = <span style={{ color: "#dc3545" }}>Нет ответа</span>;

          if (answer?.kind === "single-choice" && task.kind === "single-choice") {
            const opt = task.options.find(o => o.id === answer.optionId);
            content = <span>{opt ? opt.label : answer.optionId}</span>;
          } else if (answer?.kind === "short-text" && task.kind === "short-text") {
            content = <span>{answer.text.trim() || "(пусто)"}</span>;
          }

          return (
            <div key={task.id} className="card">
              <p style={{ fontWeight: "bold", marginTop: 0 }}>{index + 1}. {task.prompt}</p>
              <p style={{ margin: 0 }}><strong>Ответ: </strong> {content}</p>
              
              {/* Если попытка не завершена, можно удалить ответ прямо здесь */}
              {!isSubmitted && answer && (
                <button 
                  onClick={() => onDeleteAnswer(task.id)}
                  style={{ marginTop: "10px", background: "#dc3545", fontSize: "12px" }}
                >
                  Очистить ответ
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {isSubmitted ? (
          <button onClick={onRestart} style={{ width: "100%" }}>Начать новую попытку</button>
        ) : (
          <>
            <button className="btn-secondary" onClick={onBackToTasks}>Вернуться к заданиям</button>
            <button onClick={onFinish} style={{ marginLeft: "auto" }}>Завершить попытку</button>
          </>
        )}
      </div>
    </div>
  );
}