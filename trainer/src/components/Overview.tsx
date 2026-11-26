import type { TrainingSet, Answer } from "../domain";

type Props = {
  trainingSet: TrainingSet;
  answers: Record<string, Answer>;
  onRestart: () => void;
};

export function Overview({ trainingSet, answers, onRestart }: Props) {
  return (
    <div>
      <h1 style={{ color: "#28a745" }}>Попытка завершена</h1>
      <h2>{trainingSet.title}</h2>
      
      <div style={{ marginTop: "20px" }}>
        {trainingSet.tasks.map((task, index) => {
          const answer = answers[task.id];
          let content = <span style={{ color: "#dc3545" }}>Пропущено</span>;

          if (answer?.kind === "single-choice" && task.kind === "single-choice") {
            const opt = task.options.find(o => o.id === answer.optionId);
            content = <span>{opt ? opt.label : answer.optionId}</span>;
          } else if (answer?.kind === "short-text" && task.kind === "short-text") {
            content = <span>{answer.text.trim() || "(состоит только из пробелов)"}</span>;
          }

          return (
            <div key={task.id} className="card">
              <p style={{ fontWeight: "bold", marginTop: 0 }}>{index + 1}. {task.prompt}</p>
              <p style={{ margin: 0 }}><strong>Ответ: </strong> {content}</p>
            </div>
          );
        })}
      </div>

      <button onClick={onRestart} style={{ width: "100%", marginTop: "20px" }}>
        Начать новую попытку
      </button>
    </div>
  );
}