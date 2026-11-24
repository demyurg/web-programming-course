import type { TrainingSet, Result } from "../model/domain";

type Props = {
  trainingSet: TrainingSet;
  result: Result;
  onRestart: () => void;
};

export function AttemptResult({ trainingSet, result, onRestart }: Props) {
  return (
    <div>
      <h1>Результат</h1>
      <h2>
        Оценка: {result.score === null ? "Ожидает проверки" : `${result.score} / ${result.maxScore}`}
      </h2>
      
      {trainingSet.tasks.map((task, index) => {
        const item = result.items.find(i => i.taskId === task.id);
        return (
          <div key={task.id} className="card">
            <p><strong>{index + 1}. {task.prompt}</strong></p>
            <p>Статус: <b>{item?.status}</b></p>
            
            {/* Отображение null как ожидания, а не нуля */}
            {item?.score === null && <p style={{ color: "orange" }}>Ожидает проверки преподавателем</p>}
            {item?.score !== null && item?.score !== undefined && <p>Баллы: {item.score}</p>}
            
            <p><small>{item?.feedback}</small></p>
          </div>
        );
      })}
      
      <button onClick={onRestart} style={{ marginTop: "20px", width: "100%" }}>Начать новую попытку</button>
    </div>
  );
}