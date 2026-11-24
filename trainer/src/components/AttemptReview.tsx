import type { TrainingSet } from "../model/domain";
import type { State } from "../model/attempt";

type Props = {
  trainingSet: TrainingSet;
  state: State;
  onBack: () => void;
  onDelete: (taskId: string) => void;
  onFinish: () => void;
};

export function AttemptReview({ trainingSet, state, onBack, onDelete, onFinish }: Props) {
  return (
    <div>
      <h1>Обзор ответов</h1>
      {trainingSet.tasks.map((task, index) => {
        const ans = state.answers[task.id];
        let text = "Нет ответа";
        
        if (ans) {
           if (ans.kind === "single-choice" && task.kind === "single-choice") {
               text = task.options.find(o => o.id === ans.optionId)?.label || ans.optionId;
           } else if (ans.kind === "short-text") {
               text = ans.text;
           }
        }
        
        return (
          <div key={task.id} className="card">
            <p><strong>{index + 1}. {task.prompt}</strong></p>
            <p>Ответ: {text}</p>
            {ans && <button onClick={() => onDelete(task.id)} style={{ background: "#dc3545", fontSize: "12px" }}>Удалить</button>}
          </div>
        );
      })}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button className="btn-secondary" onClick={onBack}>Вернуться</button>
        <button onClick={onFinish} style={{ marginLeft: "auto", background: "green" }}>Завершить попытку</button>
      </div>
    </div>
  );
}